import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Stack
} from '@chakra-ui/react'
import distanceInWords from 'date-fns/formatDistanceToNow'

import msg from 'lib/message'

function statusToStyle(status) {
  switch (status) {
    case 'ERROR':
      return 'error'
    case 'UPLOADING':
    case 'PROCESSING':
      return 'info'
    case 'DONE':
      return 'success'
    default:
      return 'warning'
  }
}

export default function Status({
  completedAt,
  clear,
  createdAt,
  message,
  name,
  status,
  totalGrids,
  uploadedGrids,
  ...p
}) {
  return (
    <Alert status={statusToStyle(status)} {...p}>
      <AlertIcon />
      <Stack>
        <AlertTitle>
          {name} ({status})
        </AlertTitle>
        {status === 'DONE' && (
          <AlertDescription>
            {msg('spatialDatasets.finishedUploading', {
              total: `${totalGrids}`,
              completedAt: distanceInWords(completedAt)
            })}
          </AlertDescription>
        )}
        {status === 'UPLOADING' && (
          <AlertDescription>
            {msg('spatialDatasets.uploadProgress', {
              createdAt: distanceInWords(createdAt),
              completed: `${uploadedGrids}`,
              total: `${totalGrids}`
            })}
          </AlertDescription>
        )}
        {message && message.length > 0 && (
          <AlertDescription fontFamily='mono' wordBreak='break-all'>
            {message}
          </AlertDescription>
        )}
      </Stack>

      <CloseButton
        position='absolute'
        top='8px'
        right='8px'
        size='sm'
        onClick={clear}
      />
    </Alert>
  )
}
