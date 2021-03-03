import {AlertTitle} from '@chakra-ui/core'
import useStatus from 'lib/hooks/use-status'
import useIsOnline from 'lib/hooks/use-is-online'
import {useEffect, useState} from 'react'

import BannerAlert from './banner-alert'

const isValidatingTimeout = 10_000
const unusableMessage =
  'Application will be unusable until connection can be restablished.'

export default function APIStatusBar() {
  const [showIsValidating, setShowIsValidating] = useState(false)
  const isOnline = useIsOnline()
  const {error, isValidating} = useStatus()

  useEffect(() => {
    if (!isValidating) return
    const id = setTimeout(() => setShowIsValidating(true), isValidatingTimeout)
    return () => {
      clearTimeout(id)
      setShowIsValidating(false)
    }
  }, [isValidating])

  if (!isOnline) {
    // API server may be reached while offline but in development mode.
    if (error || isValidating) {
      return (
        <BannerAlert status='error' variant='solid'>
          <AlertTitle>
            You are not connected to the internet. {unusableMessage}
          </AlertTitle>
        </BannerAlert>
      )
    }
  } else if (error) {
    return (
      <BannerAlert status='error' variant='solid'>
        <AlertTitle>API server cannot be reached. {unusableMessage}</AlertTitle>
      </BannerAlert>
    )
  } else if (isValidating && showIsValidating) {
    return (
      <BannerAlert status='warning'>
        <AlertTitle>Establishing connection...</AlertTitle>
      </BannerAlert>
    )
  }
  return null
}
