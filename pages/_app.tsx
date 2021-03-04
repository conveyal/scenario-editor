import {UserProvider} from '@auth0/nextjs-auth0'
import {useToast} from '@chakra-ui/react'
import fpHas from 'lodash/fp/has'
import {NextComponentType} from 'next'
import App from 'next/app'
import Head from 'next/head'
import React, {ComponentType, ErrorInfo} from 'react'
import {SWRConfig} from 'swr'

import ChakraTheme from 'lib/chakra'
import ErrorModal from 'lib/components/error-modal'
import {AUTH_DISABLED} from 'lib/constants'
import useErrorHandlingToast from 'lib/hooks/use-error-handling-toast'
import LogRocket from 'lib/logrocket'
import {swrFetcher} from 'lib/utils/safe-fetch'
import {localUser} from 'lib/user'

import 'simplebar/dist/simplebar.css'
import '../styles.css'

// Re-use for Component's without a Layout
const EmptyLayout = ({children}) => <>{children}</>

// Components that have a layout
type ComponentWithLayout = NextComponentType & {
  Layout: ComponentType
}

// Check if a component has a Layout
const hasLayout = fpHas('Layout')

// SWRConfig wrapper
function SWRWrapper({children}) {
  const toast = useToast()
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        onError: (error) => {
          if (error.description) {
            toast({
              title: 'Error',
              description: error.description,
              position: 'top',
              status: 'error',
              isClosable: true,
              duration: null
            })
          }
        }
      }}
    >
      {children}
    </SWRConfig>
  )
}

function ErrorHandler({children}) {
  useErrorHandlingToast()
  return <>{children}</>
}

export default class ConveyalAnalysis extends App {
  state = {
    error: null
  }

  componentDidCatch(err: Error, info: ErrorInfo): void {
    LogRocket.captureException(err, {extra: {...info}})
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
        <ErrorHandler>
          <UserProvider user={AUTH_DISABLED ? localUser : pageProps.user}>
            <SWRWrapper>
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
            </SWRWrapper>
          </UserProvider>
        </ErrorHandler>
      </ChakraTheme>
    )
  }
}
