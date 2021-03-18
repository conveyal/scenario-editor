import {ChangeEvent, useCallback, useState} from 'react'

import {
  SERVER_NGINX_MAX_CLIENT_BODY_SIZE,
  SERVER_MAX_FILE_SIZE_BYTES
} from 'lib/constants'

const toMB = (b: number) => b / 1024 / 1024

const singleAlert = `Each file has a maximum limit of ${toMB(
  SERVER_MAX_FILE_SIZE_BYTES
)} MB.`
const totalAlert = `Total upload size of all files must be less than ${toMB(
  SERVER_NGINX_MAX_CLIENT_BODY_SIZE
)}MB.`

export function fileSizesAlert(
  fileSizes: number[],
  totalSize: number
): boolean {
  if (totalSize > SERVER_NGINX_MAX_CLIENT_BODY_SIZE) {
    alert(totalAlert)
    return true
  } else if (
    fileSizes.findIndex((s) => s >= SERVER_MAX_FILE_SIZE_BYTES) === -1
  ) {
    alert(singleAlert)
    return true
  }
  return false
}

export default function useFileInput() {
  const [files, setFiles] = useState<File[] | null>(null)
  const [fileSizes, setFileSizes] = useState<number[]>([])
  const [totalSize, setTotalSize] = useState(0)

  const onChangeFiles = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files)
    const fileSizes = files.map((f) => f.size)
    const totalSize = fileSizes.reduce((v, s) => v + s, 0)
    if (!fileSizesAlert(fileSizes, totalSize)) {
      setFiles(files)
      setFileSizes(fileSizes)
      setTotalSize(totalSize)
    } else {
      setFiles(null)
      setFileSizes([])
      setTotalSize(0)
    }
  }, [])

  return {
    files,
    fileSizes,
    setFiles,
    totalSize,
    onChangeFiles
  }
}
