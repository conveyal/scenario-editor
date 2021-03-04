import {Button, Stack, Text} from '@chakra-ui/react'
import React from 'react'
import {useDispatch} from 'react-redux'

import fetch from 'lib/actions/fetch'
import withRedux from 'lib/with-redux'

function SubComponent() {
  return <Button.DoesNotExist>Will not render</Button.DoesNotExist>
}

const addListener = process.browser ? window.addEventListener : () => {}
const removeListener = process.browser ? window.removeEventListener : () => {}

export default withRedux(function Debug() {
  const dispatch = useDispatch()
  const [show, setShow] = React.useState(false)
  const [error, setError] = React.useState()
  const [rejection, setRejection] = React.useState()

  React.useEffect(() => {
    const onError = (e) => {
      setError(e)
    }
    addListener('error', onError)
    return () => removeListener('error', onError)
  }, [setError]) // just on mount / dismount

  React.useEffect(() => {
    const listener = (e) => {
      setRejection(e)
    }
    addListener('unhandledrejection', listener)
    return () => removeListener('unhandledrejection', listener)
  }, [setRejection]) // just on mount / dismount

  return (
    <Stack align='center' spacing={4} mt={10} justify='center'>
      <Button onClick={() => setShow((s) => !s)} colorScheme='red'>
        Cause a React rendering error
      </Button>
      <Button
        onClick={() => {
          console.log(this.does.not.exist)
          throw new Error('This is the error name. Can it be understood?')
        }}
        colorScheme='red'
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
          new Promise((resolve, reject) =>
            reject('This is the reason why this was rejected.')
          )
        }}
        colorScheme='red'
      >
        Cause an unhandled rejection (usually displayed in sidebar)
      </Button>
      {rejection && (
        <Text color='red.600' whiteSpace='pre'>
          Rejection caught! See console for details.
        </Text>
      )}
      <Button
        onClick={() => dispatch(fetch({url: '/does/not/exits'}))}
        colorScheme='red'
      >
        Fetch a url that does not exist
      </Button>
      <Button onClick={() => dispatch(fetch({}))} colorScheme='red'>
        Fetch with invalid parameters
      </Button>
    </Stack>
  )
})

/** Debug.getInitialProps = () => {
  throw new Error('Intentional error thrown from Debug.getInitialProps.')
} */
