import {AlertTitle} from '@chakra-ui/core'
import useStatus from 'lib/hooks/use-status'
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
  const response = useStatus()

  if (!isOnline) {
    // API server may be reached while offline but in development mode.
    if (response.error || response.isValidating) {
      return (
        <BannerAlert status='error' variant='solid'>
          <AlertTitle>
            You are not connected to the internet. {unusableMessage}
          </AlertTitle>
        </BannerAlert>
      )
    }
  } else if (response.error) {
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
