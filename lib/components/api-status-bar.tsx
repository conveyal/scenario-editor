import {AlertIcon, AlertTitle, Box} from '@chakra-ui/react'
import {useEffect, useState} from 'react'

import useActivity from 'lib/hooks/use-activity'
import useIsOnline from 'lib/hooks/use-is-online'

import BannerAlert from './banner-alert'
import Spinner from './spinner'

const isValidatingTimeout = 10_000
const unusableMessage = 'Lost connection to Conveyal servers.'

const IsValidating = () => (
  <BannerAlert status='info' variant='solid'>
    <Box fontSize='1.25rem' mr={3}>
      <Spinner />
    </Box>
    <AlertTitle>Establishing connection, please wait...</AlertTitle>
  </BannerAlert>
)

const NoAPI = () => (
  <BannerAlert status='error' variant='solid'>
    <AlertIcon />
    <AlertTitle>
      {unusableMessage} Contact your support team if this message persists.
    </AlertTitle>
  </BannerAlert>
)

const NotOnline = () => (
  <BannerAlert status='error' variant='solid'>
    <AlertIcon />
    <AlertTitle>{unusableMessage} Check your internet connection.</AlertTitle>
  </BannerAlert>
)

export default function APIStatusBar() {
  const [showIsValidating, setShowIsValidating] = useState(false)
  const isOnline = useIsOnline()
  const {response} = useActivity()
  const {error, isValidating} = response

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
  } else if (error || showIsValidating) return <NotOnline />
  return null
}
