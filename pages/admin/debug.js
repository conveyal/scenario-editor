import {Button, Stack} from '@chakra-ui/core'
import React from 'react'
import {useDispatch} from 'react-redux'

function onClick(title) {
  const obj = {}
  setTimeout(() => {
    console.error(title)
    obj.does.not.exist = 10
  }, 1)
}

function SubComponent(p) {
  return (
    <Button {...p} onClick={() => onClick('Error from sub-component')}>
      Click to throw error from sub component
    </Button>
  )
}

export default function Debug() {
  const dispatch = useDispatch()
  return (
    <Stack align='center' width='400px' spacing={4} mt={10}>
      <Button onClick={() => onClick('Error from page')}>
        Click to throw error from a page
      </Button>
      <SubComponent />
      <Button onClick={() => dispatch({type: 'throw error'})}>
        Click to dispatch an action that throws an error
      </Button>
    </Stack>
  )
}

Debug.getInitialProps = () => {
  throw new Error('getInitialProps error')
}
