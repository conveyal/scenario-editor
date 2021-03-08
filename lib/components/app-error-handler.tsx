import dynamic from 'next/dynamic'
import {ErrorBoundary} from 'react-error-boundary'

import LogRocket from 'lib/logrocket'

const APIStatusBar = dynamic(() => import('lib/components/api-status-bar'), {
  ssr: false
})

const ErrorToaster = dynamic(() => import('lib/components/app-error-toaster'), {
  ssr: false
})
const ErrorModal = dynamic(() => import('lib/components/error-modal'), {
  ssr: false
})

function onError(error: Error, info: {componentStack: string}) {
  LogRocket.captureException(error, {extra: info})
}

export default function ErrorHandler({children}) {
  return (
    <ErrorBoundary FallbackComponent={ErrorModal} onError={onError}>
      <APIStatusBar />
      <ErrorToaster />
      {children}
    </ErrorBoundary>
  )
}
