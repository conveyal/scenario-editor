import {GetAccessTokenResult, initAuth0} from '@auth0/nextjs-auth0'
import {SignInWithAuth0} from '@auth0/nextjs-auth0/dist/instance'
import {fromJson as sessionFromJSON} from '@auth0/nextjs-auth0/dist/session/session'
import {parse} from 'cookie'
import {IncomingMessage, ServerResponse} from 'http'
import ms from 'ms'

import {IUser} from './user'

const rollingDuration = ms('30 days') / 1000
const httpTimeout = ms('10s')
const scope = 'openid profile id_token'

/**
 * Auth0 is initialized with the origin taken from an incoming header. With Vercel Preview Deployments,
 * a single lambda may handle multiple origins. Ex: conveyal.dev, branch-git.conveyal.vercel.app,
 * and analysis-11234234.vercel.app. Therefore we initialize a specific auth0 instance for each origin
 * and store them based on that origin.
 */
const auth0s = {
  // [origin]: ISignInWithAuth0
}

function createAuth0(baseURL: string): SignInWithAuth0 {
  if (process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true') {
    return {
      handleAuth: () => () => {},
      handleCallback: async () => {},
      handleLogin: async () => {},
      handleLogout: async () => {},
      handleProfile: async () => {},
      getAccessToken: async (): Promise<GetAccessTokenResult> => ({
        accessToken: 'access-token'
      }),
      getSession: () =>
        sessionFromJSON({
          createdAt: Date.now(),
          user: {
            name: 'local',
            'http://conveyal/accessGroup': 'local'
          },
          idToken: 'fake'
        }),
      withApiAuthRequired: (fn) => fn,
      withPageAuthRequired: (fn) => fn
    }
  } else {
    return initAuth0({
      authorizationParams: {
        scope
      },
      baseURL,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      httpTimeout,
      issuerBaseURL: process.env.AUTH0_DOMAIN,
      routes: {
        callback: '/api/callback',
        postLogoutRedirect: '/'
      },
      secret: process.env.SESSION_COOKIE_SECRET,
      session: {
        rollingDuration
      }
    })
  }
}

// Dyanmically create the Auth0 instance based upon a request
export default function initAuth0WithReq(
  req: IncomingMessage
): SignInWithAuth0 {
  const host = req.headers.host
  const protocol = /^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:'
  const origin = `${protocol}//${host}`
  if (auth0s[origin]) return auth0s[origin]
  auth0s[origin] = createAuth0(origin)
  return auth0s[origin]
}

/**
 * Flatten the session object and assign the accessGroup without the http portion.
 */
export function getUser(req: IncomingMessage, res: ServerResponse): IUser {
  const auth0 = initAuth0WithReq(req)
  const session = auth0.getSession(req, res)
  if (!session) {
    throw new Error('User session does not exist. User must be logged in.')
  }

  const user = {
    // This is a namespace for a custom claim. Not a URL: https://auth0.com/docs/tokens/guides/create-namespaced-custom-claims
    accessGroup: session.user['http://conveyal/accessGroup'],
    adminTempAccessGroup: null,
    email: session.user.name,
    idToken: session.idToken
  }

  if (user.accessGroup === process.env.NEXT_PUBLIC_ADMIN_ACCESS_GROUP) {
    const adminTempAccessGroup = parse(req.headers.cookie || '')
      .adminTempAccessGroup
    if (adminTempAccessGroup) user.adminTempAccessGroup = adminTempAccessGroup
  }

  return user
}

/**
 * Helper function for retrieving the access group.
 */
export async function getAccessGroup(
  req: IncomingMessage,
  res: ServerResponse
): Promise<string> {
  const user = await getUser(req, res)
  if (user.adminTempAccessGroup && user.adminTempAccessGroup.length > 0) {
    return user.adminTempAccessGroup
  }
  return user.accessGroup
}
