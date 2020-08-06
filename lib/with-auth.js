import {Box} from '@chakra-ui/core'
import get from 'lodash/get'
import Head from 'next/head'
import React from 'react'
import {SWRConfig} from 'swr'

import LoadingScreen from './components/loading-screen'
import {useFetchUser, UserContext} from './user'

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
    zIndex='10000'
  />
)

/**
 * Ensure that a Page component is authenticated before rendering.
 */
export default function withAuth(PageComponent) {
  return function AuthenticatedComponent(p) {
    const {user} = useFetchUser({required: true})
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
        <SWRConfig
          value={{
            fetcher: (url) =>
              fetch(url, {
                headers: {
                  Authorization: `bearer ${get(user, 'idToken')}`,
                  'X-Conveyal-Access-Group': get(user, 'adminTempAccessGroup')
                },
                mode: 'cors'
              }).then((res) => res.json())
          }}
        >
          <PageComponent {...p} />
        </SWRConfig>
      </UserContext.Provider>
    )
  }
}
