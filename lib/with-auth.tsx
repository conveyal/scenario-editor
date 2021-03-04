import {
  getSession,
  UserProvider,
  withPageAuthRequired
} from '@auth0/nextjs-auth0'
import {Box} from '@chakra-ui/react'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next'
import Head from 'next/head'
import {useEffect} from 'react'

import {AUTH_DISABLED} from 'lib/constants'

import LoadingScreen from './components/loading-screen'
import {IUser, localUser, storeUser, userFromSession} from './user'

export interface IWithAuthProps {
  user?: IUser
}

// Check if the passed in group matches the environment variable
// TODO set this server side when the user logs in
const isAdmin = (user?: IUser) =>
  user && user.accessGroup === process.env.NEXT_PUBLIC_ADMIN_ACCESS_GROUP

// DEV Bar Style
const DevBar = () => (
  <Box
    bg='red.500'
    height='1px'
    position='absolute'
    width='100vw'
    zIndex={10000}
  />
)

type SSPWithUser<T> = (
  ctx: GetServerSidePropsContext,
  user: IUser
) => Promise<GetServerSidePropsResult<T>>

export function getServerSidePropsWithAuth<T>(
  fn: SSPWithUser<T>
): GetServerSideProps {
  if (AUTH_DISABLED) {
    return async (ctx: GetServerSidePropsContext) => await fn(ctx, localUser)
  }

  return async (ctx: GetServerSidePropsContext) => {
    const session = getSession(ctx.req, ctx.res)
    if (!session?.user) {
      return {
        redirect: {
          destination: `/api/auth/login?returnTo=${ctx.resolvedUrl}`,
          permanent: false
        }
      }
    }
    return await fn(ctx, userFromSession(ctx.req, session))
  }
}

/**
 * Ensure that a Page component is authenticated before rendering.
 */
export default function withAuth(PageComponent) {
  function AuthenticatedComponent({user, ...p}: IWithAuthProps): JSX.Element {
    useEffect(() => {
      if (user) storeUser(user)
    }, [user])

    if (!user) return <LoadingScreen />
    return (
      <UserProvider user={user}>
        {isAdmin(user) && (
          <>
            <DevBar />
            <Head>
              <style id='DEVSTYLE'>{`.DEV{display: inherit;}`}</style>
            </Head>
          </>
        )}
        <PageComponent user={user} {...p} />
      </UserProvider>
    )
  }

  function UnauthenticatedComponent(p) {
    return (
      <UserProvider user={localUser}>
        <DevBar />
        <Head>
          <style id='DEVSTYLE'>{`.DEV{display: inherit;}`}</style>
        </Head>
        <PageComponent user={localUser} {...p} />
      </UserProvider>
    )
  }

  return AUTH_DISABLED
    ? UnauthenticatedComponent
    : withPageAuthRequired(AuthenticatedComponent)
}
