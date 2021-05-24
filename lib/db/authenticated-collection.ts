import {Collection, ObjectID, FindOneOptions, FilterQuery} from 'mongodb'
import fpOmit from 'lodash/fp/omit'

import {IUser} from 'lib/user'

import {connectToDatabase} from './connect'
import {serializeCollectionResults} from './utils'

/**
 * When the `adminTempAccessGroup` is set, use that instead.
 */
function getAccessGroup(session: IUser) {
  if (session.adminTempAccessGroup && session.adminTempAccessGroup.length > 0) {
    return session.adminTempAccessGroup
  }
  return session.accessGroup
}

// Omit _id, createdAt, createdBy, and accessGroup during updates
const omitImmutable = fpOmit(['_id', 'accessGroup', 'createdAt', 'createdBy'])

// Enabled collections
const collections = {
  bundles: {
    singular: 'bundle'
  },
  presets: {
    // previously known as bookmarks
    singular: 'preset'
  },
  modifications: {
    singular: 'modification'
  },
  projects: {
    singular: 'project'
  },
  regions: {
    singular: 'region'
  },
  'regional-analyses': {
    singular: 'regionalAnalysis'
  }
}

export type CollectionName = keyof typeof collections

/**
 * Ensure that all operations are only performed if the user has access.
 * TODO: Strongly type the schemas
 */
export default class AuthenticatedCollection {
  accessGroup: string // If admin, this may be the `adminTempAccessGroup`
  collection: Collection
  name: string
  singularName: string
  user: IUser

  static async with(collectionName: CollectionName, user: IUser) {
    const {db} = await connectToDatabase()
    return new AuthenticatedCollection(
      collectionName,
      db.collection(collectionName),
      user
    )
  }

  constructor(name: string, collection: Collection, user: IUser) {
    if (collections[name] === undefined) {
      throw new Error(`Collection '${name}' is not enabled.`)
    }

    this.accessGroup = getAccessGroup(user)
    this.collection = collection
    this.name = name
    this.singularName = collections[name].singular
    this.user = user
  }

  create(data: any) {
    return this.collection.insertOne({
      ...data,
      // Common fields
      _id: new ObjectID().toString(),
      accessGroup: this.accessGroup,
      nonce: new ObjectID().toString(),
      createdAt: new Date(),
      createdBy: this.user.email,
      updatedBy: this.user.email,
      updatedAt: new Date()
    })
  }

  findAll() {
    return this.collection.find(
      {
        accessGroup: this.accessGroup
      },
      {
        sort: {
          name: 1
        }
      }
    )
  }

  findOne(_id: string) {
    return this.collection.findOne({
      accessGroup: this.accessGroup,
      _id
    })
  }

  /**
   * Always override access group to ensure user has permissions.
   */
  findWhere(query: FilterQuery<any> = {}, options?: FindOneOptions<any>) {
    return this.collection.find(
      {
        ...query,
        accessGroup: this.accessGroup
      },
      options
    )
  }

  /**
   * Perform `findWhere`, convert `toArray` and `serializeCollectionResults`.
   */
  async findJSON(query: FilterQuery<any> = {}, options?: FindOneOptions<any>) {
    const results = await this.findWhere(query, options).toArray()
    return serializeCollectionResults(results)
  }

  remove(_id: string) {
    return this.collection.deleteOne({
      accessGroup: this.accessGroup,
      _id
    })
  }

  update(_id: string, newValues: any) {
    return this.collection.findOneAndUpdate(
      {
        _id,
        accessGroup: this.accessGroup,
        nonce: newValues.nonce
      },
      {
        $set: {
          ...omitImmutable(newValues),
          nonce: new ObjectID().toString(),
          updatedBy: this.user.email,
          updatedAt: new Date()
        }
      },
      {
        returnOriginal: false // return the updated document
      }
    )
  }
}
