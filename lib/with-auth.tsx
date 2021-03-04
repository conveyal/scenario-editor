import {Box} from '@chakra-ui/react'
import Head from 'next/head'

import LoadingScreen from './components/loading-screen'
import {useFetchUser, UserContext, IUser} from './user'

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
export default function withAuth(PageComponent) {
  return function AuthenticatedComponent(p: IWithAuthProps): JSX.Element {
    const {user} = useFetchUser(p.user)
    if (!user) return <LoadingScreen />
    return (
      <UserContext.Provider value={user}>
        {isAdmin(user) ? (
          <DevBar />
        ) : (
          <Head>
            <style id='DEVSTYLE'>{`.DEV{display: none;}`}</style>
          </Head>
        )}
        <PageComponent {...p} />
      </UserContext.Provider>
    )
  }
}
