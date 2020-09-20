import lowerCase from 'lodash/lowerCase'
import startCase from 'lodash/startCase'
import {NextApiResponse, NextApiRequest} from 'next'

import auth0 from 'lib/auth0'
import AuthenticatedCollection from 'lib/db/authenticated-collection'

const getAsString = (p: string | string[]) => (Array.isArray(p) ? p[0] : p)

export default auth0.requireAuthentication(async function collection(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const collectionName = getAsString(req.query.collection)
  const collection = await AuthenticatedCollection.initialize(
    req,
    res,
    collectionName
  )
  const _id = getAsString(req.query._id)

  switch (req.method) {
    case 'GET': {
      try {
        const document = await collection.findOne(_id)
        if (!document) {
          res.status(404).end()
        } else {
          res.json(document)
        }
      } catch (e) {
        res.status(400).json({
          message: `Error getting ${lowerCase(collectionName)}.`,
          error: e
        })
      }
      break
    }
    case 'PUT': {
      try {
        const updateResult = await collection.update(_id, req.body)
        if (!updateResult || !updateResult.ok) {
          res
            .status(404)
            .json({message: `${startCase(collectionName)} does not exist.`})
        } else {
          res.json(updateResult.value)
        }
      } catch (e) {
        res.status(400).json({
          message: `Error updating ${lowerCase(collectionName)}.`,
          error: e
        })
      }
      break
    }
    case 'DELETE': {
      try {
        const result = await collection.remove(_id)
        if (result) {
          res
            .status(200)
            .json({message: `${startCase(collectionName)} has been deleted.`})
        } else {
          res.status(400).json({
            message: `${startCase(collectionName)} deletion has failed.`
          })
        }
      } catch (e) {
        res.status(400).json({
          message: `Error deleting ${lowerCase(collectionName)}.`,
          error: e
        })
      }
      break
    }
    default: {
      res.setHeader('Allow', ['DELETE', 'GET', 'PUT'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
})
