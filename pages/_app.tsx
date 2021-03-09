import {NextComponentType} from 'next'
import {AppProps} from 'next/app'
import Head from 'next/head'
import {ComponentType} from 'react'

import ErrorHandler from 'lib/components/app-error-handler'
import LoadingScreen from 'lib/components/loading-screen'
import ChakraTheme from 'lib/config/chakra'
import SWRWrapper from 'lib/config/swr'

import '../styles.css'

// Re-use for Component's without a Layout
const EmptyLayout = ({children}) => <>{children}</>

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
  return (
    <ChakraTheme cookies={pageProps.cookies}>
      <ErrorHandler>
        <SWRWrapper>
          <Head>
            <title>Conveyal Analysis</title>
          </Head>
          {router.isReady ? (
            <Layout>
              <Component query={router.query} {...pageProps} />
            </Layout>
          ) : (
            <LoadingScreen />
          )}
        </SWRWrapper>
      </ErrorHandler>
    </ChakraTheme>
  )
}
