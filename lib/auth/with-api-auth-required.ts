import {getSession, withApiAuthRequired} from '@auth0/nextjs-auth0'
import {NextApiResponse, NextApiRequest} from 'next'

import {localUser, userFromSession} from 'lib/user'
import {errorToPOJO} from 'lib/utils/api'

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: CL.User
) => Promise<void>

/**
 * Create a common handler for API routes that:
 * 1. Catch and handle errors that may occur authentication.
 * 2. Ensure the user is authenticated.
 * 3. Allow offline use for development.
 */
export default function withAuthRequired(handler: Handler) {
  if (process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true') {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        await handler(req, res, localUser)
      } catch (e) {
        res.status(400).json(errorToPOJO(e))
      }
    }
  }

  return withApiAuthRequired(
    async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        const user = userFromSession(req, getSession(req, res))
        await handler(req, res, user)
      } catch (e) {
        res.status(400).json(errorToPOJO(e))
      }
    }
  )
}
