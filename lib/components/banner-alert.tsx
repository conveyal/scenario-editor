import {Alert, AlertProps} from '@chakra-ui/react'

export default function BannerAlert({children, ...p}: AlertProps) {
  return (
    <Alert
      alignItems='center'
      justifyContent='center'
      width='100vw'
      zIndex={10_000}
      {...p}
    >
      {children}
    </Alert>
  )
}
