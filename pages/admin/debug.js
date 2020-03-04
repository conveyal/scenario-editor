import {Button, Stack, Text} from '@chakra-ui/core'
import React from 'react'

function SubComponent() {
  return <Button.DoesNotExist>Will not render</Button.DoesNotExist>
}

const addListener = process.browser ? window.addEventListener : () => {}
const removeListener = process.browser ? window.removeEventListener : () => {}

export default function Debug() {
  const [show, setShow] = React.useState(false)
  const [error, setError] = React.useState()
  const [rejection, setRejection] = React.useState()

  React.useEffect(() => {
    const onError = e => {
      console.error('error', e)
      setError(e)
    }
    addListener('error', onError)
    return () => removeListener('error', onError)
  }, [])

  React.useEffect(() => {
    const listener = e => {
      console.error('rejection', e)
      setRejection(e)
    }
    addListener('unhandledrejection', listener)
    return () => removeListener('unhandledrejection', listener)
  }, [])

  return (
    <Stack align='center' spacing={4} mt={10} justify='center'>
      <Button onClick={() => setShow(s => !s)} variantColor='red'>
        Cause a React rendering error
      </Button>
      <Button
        onClick={() => {
          throw new Error('Thrown error.')
        }}
        variantColor='red'
      >
        Throw an error (usually displayed in the sidebar)
      </Button>
      {show && <SubComponent />}
      {error && (
        <Text color='red.600' whiteSpace='pre'>
          Error caught! See console for details.
        </Text>
      )}
      <Button
        onClick={() => {
          new Promise((resolve, reject) => reject('Rejected!'))
        }}
        variantColor='red'
      >
        Cause an unhandled rejection (usually displayed in sidebar)
      </Button>
      {rejection && (
        <Text color='red.600' whiteSpace='pre'>
          Rejection caught! See console for details.
        </Text>
      )}
    </Stack>
  )
}

Debug.getInitialProps = () => {
  throw new Error('Intentional error thrown from Debug.getInitialProps.')
}
