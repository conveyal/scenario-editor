import {Collection, ObjectID, FindOneOptions, FilterQuery} from 'mongodb'
import fpOmit from 'lodash/fp/omit'

import {getSession} from 'lib/auth0'
import {IUser} from 'lib/user'

import {connectToDatabase} from './connect'

function getAccessGroup(session: IUser) {
  if (session.adminTempAccessGroup && session.adminTempAccessGroup.length > 0) {
    return session.adminTempAccessGroup
  }
  return session.accessGroup
}

// Omit _id, createdAt, createdBy, and accessGroup during updates
const omitImmutable = fpOmit(['_id', 'accessGroup', 'createdAt', 'createdBy'])

// Enabled collections
const collections = ['analysisPresets', 'modifications', 'projects', 'regions']

/**
 * Ensure that all operations are only performed if the user has access.
 */
export default class AuthenticatedCollection {
  accessGroup: string // If admin, this may be the `adminTempAccessGroup`
  collection: Collection
  session: IUser

  static async initialize(req, res, collectionName) {
    if (collections.indexOf(collectionName) === -1) {
      throw new Error(`Collection '${collectionName}' is not enabled.`)
    }

    let session = null
    try {
      session = await getSession(req)
    } catch (e) {
      console.error('Error while retrieving the session.', e)
    }
    if (session == null) {
      res.writeHead(302, {
        Location: '/api/login'
      })
      res.end()
      return
    }

    const {db} = await connectToDatabase()
    return new AuthenticatedCollection(db.collection(collectionName), session)
  }

  constructor(collection: Collection, session: IUser) {
    this.accessGroup = getAccessGroup(session)
    this.collection = collection
    this.session = session
  }

  create(data: any) {
    return this.collection.insertOne({
      ...data,
      // Common fields
      _id: new ObjectID().toString(),
      accessGroup: this.accessGroup,
      nonce: new ObjectID().toString(),
      createdBy: this.session.email,
      updatedBy: this.session.email
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
          updatedBy: this.session.email
        }
      }
    )
  }
}
