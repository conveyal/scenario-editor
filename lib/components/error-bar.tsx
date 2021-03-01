import {Alert, AlertIcon, AlertTitle} from '@chakra-ui/core'

export default function ErrorBar({children}) {
  return (
    <Alert
      alignItems='center'
      justifyContent='center'
      status='error'
      variant='solid'
      width='100vw'
      zIndex={10_000}
    >
      <AlertIcon />
      <AlertTitle>{children}</AlertTitle>
    </Alert>
  )
}
