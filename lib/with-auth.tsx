import {UserProvider, withPageAuthRequired} from '@auth0/nextjs-auth0'
import {Box} from '@chakra-ui/react'
import Head from 'next/head'
import {useEffect} from 'react'

import LoadingScreen from './components/loading-screen'
import {IUser, storeUser} from './user'

export interface IWithAuthProps {
  user?: IUser
}

// Check if the passed in group matches the environment variable
// TODO set this server side when the user logs in
const isAdmin = (user) =>
  user && user.accessGroup === process.env.NEXT_PUBLIC_ADMIN_ACCESS_GROUP

// DEV Bar Style
const DevBar = () => (
  <Box
    className='DEV'
    mt='-4px'
    position='absolute'
    width='100vw'
    zIndex={10000}
  />
)

/**
 * Ensure that a Page component is authenticated before rendering.
 */
const withAuth = (PageComponent) =>
  withPageAuthRequired(function AuthenticatedComponent(
    p: IWithAuthProps
  ): JSX.Element {
    useEffect(() => {
      if (p.user) storeUser(p.user)
    }, [p.user])

    if (!p.user) return <LoadingScreen />
    return (
      <UserProvider user={p.user}>
        {isAdmin(p.user) ? (
          <DevBar />
        ) : (
          <Head>
            <style id='DEVSTYLE'>{`.DEV{display: none;}`}</style>
          </Head>
        )}
        <PageComponent {...p} />
      </UserProvider>
    )
  })

export default withAuth
