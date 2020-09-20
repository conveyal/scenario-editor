import fpHas from 'lodash/fp/has'
import {NextComponentType} from 'next'
import App from 'next/app'
import Head from 'next/head'
import Router from 'next/router'
import React, {ComponentType, ErrorInfo} from 'react'
import ReactGA from 'react-ga'
import {SWRConfig} from 'swr'

import ChakraTheme from 'lib/chakra'
import ErrorModal from 'lib/components/error-modal'
import LogRocket from 'lib/logrocket'
import {swrConfig} from 'lib/utils/safe-fetch'

import 'simplebar/dist/simplebar.css'
import '../styles.css'

// Initialize analytics if tracking ID is provided
const TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID
if (TRACKING_ID != null) {
  ReactGA.initialize(TRACKING_ID)
  // Log all page views
  Router.events.on('routeChangeComplete', () => {
    ReactGA.pageview(Router.pathname)
  })
}

// Re-use for Component's without a Layout
const EmptyLayout = ({children}) => <>{children}</>

// Components that have a layout
type ComponentWithLayout = NextComponentType & {
  Layout: ComponentType
}

// Check if a component has a Layout
const hasLayout = fpHas('Layout')

export default class ConveyalAnalysis extends App {
  state = {
    error: null
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    LogRocket.captureException(err, {extra: {...info}})
  }

  componentDidMount(): void {
    if (TRACKING_ID != null) {
      // Log initial page view
      ReactGA.pageview(Router.pathname)
    }
  }

  static getDerivedStateFromError(error: Error): {error: Error} {
    return {error}
  }

  render(): JSX.Element {
    const {Component, pageProps} = this.props
    const Layout = hasLayout(Component)
      ? (Component as ComponentWithLayout).Layout
      : EmptyLayout
    return (
      <ChakraTheme>
        <SWRConfig value={swrConfig}>
          <Head>
            <title key='title'>Conveyal Analysis</title>
          </Head>
          {this.state.error ? (
            <ErrorModal
              error={this.state.error}
              clear={() => this.setState({error: null})}
              title='Application error'
            />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </SWRConfig>
      </ChakraTheme>
    )
  }
}

/**
 * Track UI performance. Learn more here: https://nextjs.org/docs/advanced-features/measuring-performance
 */
export function reportWebVitals({id, name, label, value}) {
  if (TRACKING_ID != null) {
    ReactGA.ga('send', 'event', {
      eventCategory:
        label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      eventAction: name,
      eventValue: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
      eventLabel: id, // id unique to current page load
      nonInteraction: true // avoids affecting bounce rate.
    })
  }
}
