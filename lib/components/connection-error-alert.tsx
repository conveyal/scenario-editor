import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack
} from '@chakra-ui/react'

import message from '../message'

import {ExternalLink} from './link'

export default function ConnectionErrorAlert({children}) {
  return (
    <Alert status='error' m={4} maxWidth='320px'>
      <AlertIcon />
      <Stack>
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>{children}</AlertDescription>
        <AlertDescription>
          <>{message('error.report')} </>
          <ExternalLink href='mailto:support@conveyal.com'>
            support@conveyal.com
          </ExternalLink>
        </AlertDescription>
      </Stack>
    </Alert>
  )
}
