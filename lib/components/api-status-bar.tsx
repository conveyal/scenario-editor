import {AlertTitle} from '@chakra-ui/core'
import useApiVersion from 'lib/hooks/use-api-version'
import useIsOnline from 'lib/hooks/use-is-online'
import {useEffect, useState} from 'react'

import BannerAlert from './banner-alert'

const isValidatingTimeout = 10_000
function useTimeout(timeout = isValidatingTimeout) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setTimeout(() => setReady(true), timeout)
  }, [timeout])
  return ready
}

const unusableMessage =
  'Application will be unusable until connection can be restablished.'
export default function APIStatusBar() {
  const showIsValidating = useTimeout()
  const isOnline = useIsOnline()
  const response = useApiVersion()

  if (response.error) {
    if (!isOnline)
      return (
        <BannerAlert status='error' variant='solid'>
          <AlertTitle>
            You are not connected to the internet. {unusableMessage}
          </AlertTitle>
        </BannerAlert>
      )
    return (
      <BannerAlert status='error' variant='solid'>
        <AlertTitle>API server cannot be reached. {unusableMessage}</AlertTitle>
      </BannerAlert>
    )
  } else if (response.isValidating && showIsValidating) {
    return (
      <BannerAlert status='warning'>
        <AlertTitle>Establishing connection...</AlertTitle>
      </BannerAlert>
    )
  }
  return null
}
