import get from 'lodash/get'
import {NextApiRequest, NextApiResponse} from 'next'

import auth0 from 'lib/auth0'

export default async function login(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const session = await auth0.getSession(req)
    await auth0.handleLogin(req, res, {
      authParams: {
        login_hint: get(session, 'user.name')
      },
      redirectTo: Array.isArray(req.query.redirectTo)
        ? req.query.redirectTo[0]
        : req.query.redirectTo
    })
  } catch (error) {
    console.error(error)
    res.status(error.status || 500).end(error.message)
  }
}
