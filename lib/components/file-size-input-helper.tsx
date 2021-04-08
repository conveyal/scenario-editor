import {FormHelperText} from '@chakra-ui/react'

import {
  SERVER_NGINX_MAX_CLIENT_BODY_SIZE,
  SERVER_MAX_FILE_SIZE_BYTES
} from 'lib/constants'

const toMB = (bytes: number) => bytes / 1024 / 1024

export default function FileSizeInputHelper({
  maxSingleBytes = SERVER_MAX_FILE_SIZE_BYTES,
  maxTotalBytes = SERVER_NGINX_MAX_CLIENT_BODY_SIZE,
  ...p
}) {
  return (
    <FormHelperText {...p}>
      Max file size is {toMB(maxSingleBytes)} MB. Total size of all files must
      be less than {toMB(maxTotalBytes)}MB.
    </FormHelperText>
  )
}
