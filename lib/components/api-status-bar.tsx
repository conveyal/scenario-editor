import useApiVersion from 'lib/hooks/use-api-version'
import useIsOnline from 'lib/hooks/use-is-online'

import ErrorBar from './error-bar'

const unusableMessage =
  'Application will be unusable until connection can be restablished.'
export default function APIStatusBar() {
  const isOnline = useIsOnline()
  const {error} = useApiVersion()
  if (error) {
    if (!isOnline)
      return (
        <ErrorBar>
          You are not connected to the internet. {unusableMessage}
        </ErrorBar>
      )
    return <ErrorBar>API server cannot be reached. {unusableMessage}</ErrorBar>
  }
  return null
}
