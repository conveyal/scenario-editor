import {
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
  handleProfile,
  Session
} from '@auth0/nextjs-auth0'
import {NextApiRequest, NextApiResponse} from 'next'

import {userFromSession} from 'lib/user'
import {errorToPOJO} from 'lib/utils/api'

const scope = 'openid email profile id_token'

function getBaseURL(req: NextApiRequest): string {
  const host = req.headers.host
  const protocol = /^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:'
  return `${protocol}//${host}`
}

function afterCallback(
  req: NextApiRequest,
  _: NextApiResponse,
  session: Session
) {
  return {
    ...session,
    user: userFromSession(req, session)
  }
}

export default handleAuth({
  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleCallback(req, res, {
        afterCallback,
        redirectUri: `${getBaseURL(req)}/api/auth/callback`
      })
    } catch (e) {
      res.status(400).json(errorToPOJO(e))
    }
  },
  async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogin(req, res, {
        authorizationParams: {
          redirect_uri: `${getBaseURL(req)}/api/auth/callback`,
          scope
        }
      })
    } catch (e) {
      res.status(400).json(errorToPOJO(e))
    }
  },
  async logout(req: NextApiRequest, res: NextApiResponse) {
    try {
      await handleLogout(req, res, {
        returnTo: getBaseURL(req)
      })
    } catch (e) {
      res.status(400).json(errorToPOJO(e))
    }
  },
  async profile(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      await handleProfile(req, res, {
        afterRefetch: afterCallback
      })
    } catch (e) {
      res.status(400).json(errorToPOJO(e))
    }
  }
})
