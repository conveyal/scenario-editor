import {AlertTitle} from '@chakra-ui/react'
import useStatus from 'lib/hooks/use-status'
import useIsOnline from 'lib/hooks/use-is-online'
import {useEffect, useState} from 'react'

import BannerAlert from './banner-alert'

const isValidatingTimeout = 10_000
const unusableMessage =
  'Application will be unusable until connection can be restablished.'

const IsValidating = () => (
  <BannerAlert status='warning'>
    <AlertTitle>Establishing connection...</AlertTitle>
  </BannerAlert>
)

const NoAPI = () => (
  <BannerAlert status='error' variant='solid'>
    <AlertTitle>{unusableMessage} Contact your support team if this message persists.</AlertTitle>
  </BannerAlert>
)

const NotOnline = () => (
  <BannerAlert status='error' variant='solid'>
    <AlertTitle>
      {unusableMessage} Check your internet connection.
    </AlertTitle>
  </BannerAlert>
)

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

  if (isOnline) {
    if (error) return <NoAPI />
    if (isValidating && showIsValidating) return <IsValidating />
  } else if (error || isValidating) return <NotOnline />
  return null
}
