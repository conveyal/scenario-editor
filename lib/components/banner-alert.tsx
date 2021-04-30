import {Alert, AlertProps} from '@chakra-ui/react'

import {POPOVER_Z} from 'lib/constants/z-index'

export default function BannerAlert({children, ...p}: AlertProps) {
  return (
    <Alert
      alignItems='center'
      justifyContent='center'
      maxWidth='100%'
      width='100vw'
      zIndex={POPOVER_Z}
      {...p}
    >
      {children}
    </Alert>
  )
}
