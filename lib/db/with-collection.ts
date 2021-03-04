import {getSession, withApiAuthRequired} from '@auth0/nextjs-auth0'
import {NextApiResponse, NextApiRequest} from 'next'

import {AUTH_DISABLED} from 'lib/constants'
import {localUser, userFromSession} from 'lib/user'
import {errorToPOJO, getQueryAsString} from 'lib/utils/api'

import AuthenticatedCollection from './authenticated-collection'

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse,
  collection: AuthenticatedCollection
) => Promise<void>

/**
 * Create a common handler for AuthenticatedCollections that:
 * 1. Catch and handle errors that may occur during initialization.
 * 2. Ensure the user is authenticated.
 */
export default function withCollection(handler: Handler) {
  if (AUTH_DISABLED) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const name = getQueryAsString(req.query.collection)
        const collection = await AuthenticatedCollection.initFromUser(
          name,
          localUser
        )
        await handler(req, res, collection)
      } catch (e) {
        res.status(400).json(errorToPOJO(e))
      }
    }
  }

  return withApiAuthRequired(
    async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const user = userFromSession(req, getSession(req, res))
        const name = getQueryAsString(req.query.collection)
        const collection = await AuthenticatedCollection.initFromUser(
          name,
          user
        )
        await handler(req, res, collection)
      } catch (e) {
        res.status(400).json(errorToPOJO(e))
      }
    }
  )
}
