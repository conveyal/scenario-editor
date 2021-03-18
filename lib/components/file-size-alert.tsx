import {Alert} from '@chakra-ui/react'

import {
  SERVER_NGINX_MAX_CLIENT_BODY_SIZE,
  SERVER_MAX_FILE_SIZE_BYTES
} from 'lib/constants'

const toMB = (b: number) => b / 1024 / 1024

export function fileSizesTooLarge(files: File[]): boolean {
  const sizes = files.map((f) => f?.size)
  const totalSize = sizes.reduce((v, s) => v + s, 0)
  if (totalSize > SERVER_NGINX_MAX_CLIENT_BODY_SIZE) return true
  return sizes.findIndex((s) => s >= SERVER_MAX_FILE_SIZE_BYTES) === -1
}

export default function FileSizeAlert({
  files,
  isInvalid,
  ...p
}: {
  files?: File[]
  isInvalid?: boolean
}) {
  const invalidFileSizes =
    isInvalid === undefined ? fileSizesTooLarge([...files]) : isInvalid
  if (!invalidFileSizes) return null
  return (
    <Alert status='error' {...p}>
      Each file has a maximum limit of {toMB(SERVER_MAX_FILE_SIZE_BYTES)}
      MB. Total upload size of all files must be less than{' '}
      {toMB(SERVER_NGINX_MAX_CLIENT_BODY_SIZE)}MB.
    </Alert>
  )
}
