import {NextComponentType} from 'next'
import App from 'next/app'
import Head from 'next/head'
import Router from 'next/router'
import React, {ComponentType, ErrorInfo} from 'react'
import ReactGA from 'react-ga'

import ChakraTheme from '../lib/chakra'
import {ErrorModal} from '../lib/components/error-modal'
import LogRocket from '../lib/logrocket'

import 'react-datetime/css/react-datetime.css'
import '../styles.css'

if (process.env.GA_TRACKING_ID) {
  ReactGA.initialize(process.env.GA_TRACKING_ID)
  // Log all page views
  Router.events.on('routeChangeComplete', () => {
    ReactGA.pageview(Router.pathname)
  })
}

// Components that have a layout
type ComponentWithLayout = NextComponentType & {
  Layout: ComponentType
}

export default class ConveyalAnalysis extends App {
  state = {
    error: null
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    LogRocket.captureException(err, {extras: info})
  }

  componentDidMount() {
    if (process.env.GA_TRACKING_ID) {
      // Log initial page view
      ReactGA.pageview(Router.pathname)
    }
  }

  static getDerivedStateFromError(error: Error) {
    return {error}
  }

  render() {
    const {Component} = this.props
    const Layout = Component.hasOwnProperty('Layout')
      ? (Component as ComponentWithLayout).Layout
      : null
    return (
      <ChakraTheme>
        <Head>
          <title key='title'>Conveyal Analysis</title>
        </Head>
        {this.state.error ? (
          <ErrorModal
            error={this.state.error}
            clear={() => this.setState({error: null})}
          />
        ) : Layout ? (
          <Layout>
            <Component />
          </Layout>
        ) : (
          <Component />
        )}
      </ChakraTheme>
    )
  }
}

/**
 * Track UI performance. Learn more here: https://nextjs.org/docs/advanced-features/measuring-performance
 */
export function reportWebVitals({id, name, label, value}) {
  if (process.env.GA_TRACKING_ID) {
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
