import {NextComponentType} from 'next'
import {AppProps} from 'next/app'
import {ComponentType} from 'react'

import ErrorHandler from 'lib/components/app-error-handler'
import ChakraTheme from 'lib/config/chakra'
import SWRWrapper from 'lib/config/swr'

import 'simplebar/dist/simplebar.css'
import '../styles.css'

// Re-use for Component's without a Layout
const EmptyLayout = ({children}) => <>{children}</>

// Components that have a layout
type ComponentWithLayout = NextComponentType & {
  Layout: ComponentType
}

export default function ConveyalAnalysis({Component, pageProps}: AppProps) {
  const Layout = Object.prototype.hasOwnProperty.call(Component, 'Layout')
    ? (Component as ComponentWithLayout).Layout
    : EmptyLayout
  return (
    <ChakraTheme cookies={pageProps.cookies}>
      <ErrorHandler>
        <SWRWrapper>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SWRWrapper>
      </ErrorHandler>
    </ChakraTheme>
  )
}
