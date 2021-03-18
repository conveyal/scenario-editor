import {useToast} from '@chakra-ui/toast'
import {ChangeEvent, useCallback, useState} from 'react'

import {
  SERVER_NGINX_MAX_CLIENT_BODY_SIZE,
  SERVER_MAX_FILE_SIZE_BYTES
} from 'lib/constants'

const toMB = (b: number) => b / 1024 / 1024

const singleAlert = (b) => `Each file has a maximum limit of ${toMB(b)}MB.`
const totalAlert = (b) =>
  `Total size of all files must be less than ${toMB(b)}MB.`

function getFileSizesAlert(
  fileSizes: number[],
  totalSize: number,
  fileMaxBytes: number,
  totalMaxBytes: number
): string | void {
  if (totalSize > totalMaxBytes) return totalAlert(totalMaxBytes)
  if (fileSizes.findIndex((s) => s >= fileMaxBytes) !== -1)
    return singleAlert(fileMaxBytes)
}

export default function useFileInput(
  {fileMaxBytes, totalMaxBytes} = {
    fileMaxBytes: SERVER_MAX_FILE_SIZE_BYTES,
    totalMaxBytes: SERVER_NGINX_MAX_CLIENT_BODY_SIZE
  }
) {
  const toast = useToast()
  const [files, setFiles] = useState<File[] | null>(null)
  const [fileSizes, setFileSizes] = useState<number[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const [value, setValue] = useState<string | string[]>('')

  const onChangeFiles = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.currentTarget.files)
      const fileSizes = files.map((f) => f.size)
      const totalSize = fileSizes.reduce((v, s) => v + s, 0)
      const alertText = getFileSizesAlert(
        fileSizes,
        totalSize,
        fileMaxBytes,
        totalMaxBytes
      )
      if (typeof alertText === 'string') {
        e.preventDefault()
        setFiles(null)
        setFileSizes([])
        setTotalSize(0)
        setValue('')
        toast({
          title: 'Invalid File Selected',
          description: alertText,
          position: 'top',
          isClosable: true,
          status: 'error'
        })
        return false
      } else {
        setFiles(files)
        setFileSizes(fileSizes)
        setTotalSize(totalSize)
        setValue(e.currentTarget.value)
      }
    },
    [fileMaxBytes, toast, totalMaxBytes]
  )

  return {
    files,
    fileSizes,
    setFiles,
    totalSize,
    onChangeFiles,
    value
  }
}
