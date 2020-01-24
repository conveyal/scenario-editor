import {Box, Flex} from '@chakra-ui/core'
import App from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import withRedux from 'next-redux-wrapper'
import React from 'react'
import {Provider} from 'react-redux'

import {setQueryString} from 'lib/actions'
import {AuthContext} from 'lib/auth'
import ChakraTheme from 'lib/chakra'
import State from 'lib/components/state'
import useRouteChanging from 'lib/hooks/use-route-changing'
import {timer} from 'lib/utils/metric'
import createStore from 'lib/store'

import 'react-datetime/css/react-datetime.css'
import '../styles.css'

const ErrorModal = dynamic(() => import('lib/components/error-modal'))
const Map = dynamic(() => import('lib/components/map'), {ssr: false})
const Sidebar = dynamic(() => import('lib/components/sidebar'))

// Check if the passed in group matches the environment variable
const isAdmin = user =>
  user && user.accessGroup === process.env.ADMIN_ACCESS_GROUP

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
 * Function to check if the path needs the map.
 */
const pathUsesMap = path => path.startsWith('/region')

/**
 * Provides the redux store and provider for all pages.
 */
export default withRedux(createStore)(
  class extends App {
    static async getInitialProps({Component, ctx}) {
      const timeApp = timer('App.getInitialProps')

      // Set the query string in the store
      // TODO ideally stop duplicating this data in the store
      ctx.store.dispatch(setQueryString(ctx.query))

      try {
        let initialProps = {}
        if (Component.getInitialProps) {
          initialProps = await Component.getInitialProps(ctx)
        }

        // Always pass the path information
        const pageProps = {
          ...initialProps,
          ...(ctx.query || {}),
          query: ctx.query
        }

        return {pageProps}
      } catch (e) {
        console.error('Error getting initial props', e)
        return {error: e}
      } finally {
        timeApp.end()
      }
    }

    componentDidCatch(err) {
      console.error(err)
    }

    render() {
      const p = this.props
      return (
        <ChakraTheme>
          <AuthContext.Provider value={p.pageProps.user}>
            <Provider store={p.store}>
              <Head>
                <title key='title'>Conveyal Analysis</title>
                {isAdmin(p.pageProps.user) && (
                  <style id='DEVSTYLE'>{`.DEV{display: inherit;}`}</style>
                )}
              </Head>
              <DevBar />
              <ErrorModal />

              {pathUsesMap(p.router.pathname) ? (
                <ComponentWithMap {...p} />
              ) : (
                <p.Component {...p.pageProps} />
              )}
            </Provider>
          </AuthContext.Provider>
        </ChakraTheme>
      )
    }
  }
)

const noopFragment = () => <React.Fragment />

/**
 * Components are rendered this way so that the map does not get unmounted
 * and remounted on each page change. There is probably a better way to do this
 * but I have not figured out a better solution yet.
 */
function ComponentWithMap(p) {
  const [routeChanging] = useRouteChanging()

  return (
    <State initialState={noopFragment}>
      {(mapChildren, setMapChildren) => (
        <Flex pointerEvents={routeChanging ? 'none' : 'inherit'}>
          <Sidebar />
          <Box
            borderRight='1px solid #ddd'
            bg='#fff'
            opacity={routeChanging ? 0.4 : 1}
          >
            <p.Component {...p.pageProps} setMapChildren={setMapChildren} />
          </Box>
          <Box
            flexGrow='1'
            height='100vh'
            opacity={routeChanging ? 0.4 : 1}
            position='relative'
          >
            <Map>{mapChildren}</Map>
          </Box>
        </Flex>
      )}
    </State>
  )
}
