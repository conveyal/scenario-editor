import {UserProvider} from '@auth0/nextjs-auth0'
import {NextComponentType} from 'next'
import {AppProps} from 'next/app'
import Head from 'next/head'
import {ComponentType} from 'react'

import {AUTH_DISABLED, FONT_URL} from 'lib/constants'
import {localUser} from 'lib/user'

import ErrorHandler from 'lib/components/app-error-handler'
import ChakraTheme from 'lib/config/chakra'
import SWRWrapper from 'lib/config/swr'
import EmptyLayout from 'lib/layouts/empty'

import '../styles.css'

// Components that have a layout
type ComponentWithLayout = NextComponentType & {
  Layout: ComponentType
}

export default function ConveyalAnalysis({
  Component,
  pageProps,
  router
}: AppProps) {
  const Layout = Object.prototype.hasOwnProperty.call(Component, 'Layout')
    ? (Component as ComponentWithLayout).Layout
    : EmptyLayout
  const user = AUTH_DISABLED ? localUser : pageProps.user
  return (
    <UserProvider user={user}>
      <style jsx global>{`
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 100 900;
          font-display: optional;
          src: url(${FONT_URL}) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
            U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193,
            U+2212, U+2215, U+FEFF, U+FFFD;
        }
      `}</style>
      <ChakraTheme>
        <ErrorHandler>
          <SWRWrapper>
            <Head>
              <title>Conveyal Analysis</title>
            </Head>
            <Layout>
              <Component query={router.query} {...pageProps} />
            </Layout>
          </SWRWrapper>
        </ErrorHandler>
      </ChakraTheme>
    </UserProvider>
  )
}
