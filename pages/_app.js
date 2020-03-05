import {Box, Flex} from '@chakra-ui/core'
import get from 'lodash/get'
import App from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import withRedux from 'next-redux-wrapper'
import React from 'react'
import {Provider} from 'react-redux'

import {setQueryString} from 'lib/actions'
import ChakraTheme from 'lib/chakra'
import State from 'lib/components/state'
import useRouteChanging from 'lib/hooks/use-route-changing'
import LogRocket from 'lib/logrocket'
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
    state = {}

    static async getInitialProps({Component, ctx}) {
      const timeApp = timer('App.getInitialProps')

      // Set the query string in the store. This action mutates the store
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
        return {
          error: {
            environment: process.browser ? 'browser' : 'server',
            message: e.message,
            stack: JSON.stringify(e.stack, null, '\n')
          },
          pageProps: {}
        }
      } finally {
        timeApp.end()
      }
    }

    componentDidCatch(err, info) {
      LogRocket.captureException(err, {
        tags: {
          accessGroup: get(this.props, 'pageProps.user.accessGroup'),
          page: get(this.props, 'Component.displayName'),
          pathname: get(this.props, 'router.pathname')
        },
        extras: info
      })
    }

    static getDerivedStateFromError(error) {
      return {
        clearedError: false,
        error
      }
    }

    clearError = () => {
      this.setState({clearedError: true, error: null})
    }

    render() {
      const p = this.props
      const s = this.state
      // Allow clearing a prop error
      const error = s.clearedError ? null : s.error || p.error
      return (
        <ChakraTheme>
          <Provider store={p.store}>
            <Head>
              <title key='title'>Conveyal Analysis</title>
              {isAdmin(p.pageProps.user) && (
                <style id='DEVSTYLE'>{`.DEV{display: inherit !important;}`}</style>
              )}
            </Head>
            <DevBar />
            <ErrorModal error={error} clear={this.clearError} />

            {!error &&
              (pathUsesMap(p.router.pathname) ? (
                <ComponentWithMap {...p} />
              ) : (
                <p.Component {...p.pageProps} />
              ))}
          </Provider>
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
          <style jsx global>{`
            body {
              height: 100vh;
              overflow: hidden;
              width: 100vw;
            }
          `}</style>
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
