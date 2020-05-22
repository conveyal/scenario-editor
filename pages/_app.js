import App from 'next/app'
import Head from 'next/head'
import React from 'react'

import ChakraTheme from '../lib/chakra'
import {ErrorModal} from '../lib/components/error-modal'
import ga from '../lib/ga'
import LogRocket from '../lib/logrocket'

import 'react-datetime/css/react-datetime.css'
import '../styles.css'

export default class ConveyalApp extends App {
  state = {}

  componentDidCatch(err, info) {
    LogRocket.captureException(err, {extras: info})
  }

  static getDerivedStateFromError(error) {
    return {error}
  }

  render() {
    const {Component} = this.props
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
        ) : Component.Layout ? (
          <Component.Layout>
            <Component />
          </Component.Layout>
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
  ga('send', 'event', {
    eventCategory:
      label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
    eventAction: name,
    eventValue: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
    eventLabel: id, // id unique to current page load
    nonInteraction: true // avoids affecting bounce rate.
  })
}
