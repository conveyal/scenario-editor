import {Alert, AlertIcon, AlertProps} from '@chakra-ui/core'

export default function BannerAlert({children, ...p}: AlertProps) {
  return (
    <Alert
      alignItems='center'
      justifyContent='center'
      width='100vw'
      zIndex={10_000}
      {...p}
    >
      <AlertIcon />
      {children}
    </Alert>
  )
}
