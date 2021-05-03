import {Alert, AlertProps} from '@chakra-ui/react'

import {POPOVER_Z} from 'lib/constants/z-index'

export default function BannerAlert({children, ...p}: AlertProps) {
  return (
    <Alert
      alignItems='center'
      justifyContent='center'
      width='100%'
      zIndex={POPOVER_Z}
      {...p}
    >
      {children}
    </Alert>
  )
}
