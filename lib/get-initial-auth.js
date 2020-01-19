import Router from 'next/router'

import {isAuthenticated} from 'lib/auth'
import {timer} from 'lib/utils/metric'
import timeout from 'lib/utils/timeout'

export default async function checkAuth(ctx) {
  const timeAuth = timer('auth')
  try {
    const user = await isAuthenticated(ctx)
    return {user}
  } catch (e) {
    console.error(e)

    // Wait five seconds
    await timeout(5000)

    // User is not logged in, redirect to login
    if (process.browser) {
      Router.push({
        pathname: '/login',
        query: {
          redirectTo: Router.route
        }
      })
    } else {
      ctx.res.writeHead(302, {
        Location: `/login?redirectTo=${ctx.asPath}`
      })
      ctx.res.end()
    }

    throw e
  } finally {
    timeAuth.end()
  }
}
