import {NextApiResponse, NextApiRequest} from 'next'

import withApiAuthRequired from 'lib/auth/with-api-auth-required'
import {errorToPOJO, getQueryAsString} from 'lib/utils/api'

import AuthenticatedCollection, {
  CollectionName
} from './authenticated-collection'

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse,
  collection: AuthenticatedCollection,
  user: CL.User
) => Promise<void>

/**
 * Create a common handler for AuthenticatedCollections that:
 * 1. Catch and handle errors that may occur during initialization.
 * 2. Ensure the user is authenticated.
 */
export default function withCollection(name: CollectionName, handler: Handler) {
  return withApiAuthRequired(async (req, res, user) => {
    try {
      const collection = await AuthenticatedCollection.with(name, user)
      await handler(req, res, collection, user)
    } catch (e) {
      res.status(400).json(errorToPOJO(e))
    }
  })
}

export function withCollectionFromQueryParameter(handler: Handler) {
  return withApiAuthRequired(async (req, res, user) => {
    try {
      const name = getQueryAsString(req.query.collection) as CollectionName
      const collection = await AuthenticatedCollection.with(name, user)
      await handler(req, res, collection, user)
    } catch (e) {
      res.status(400).json(errorToPOJO(e))
    }
  })
}
