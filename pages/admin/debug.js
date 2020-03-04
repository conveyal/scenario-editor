import {Button} from '@chakra-ui/core'
import React from 'react'

function onClick(title) {
  setTimeout(() => {
    throw new Error(title)
  }, 1)
}

function SubComponent() {
  return (
    <Button onClick={() => onClick('Error from sub-component')}>
      Click to throw error from sub component
    </Button>
  )
}

export default function Debug() {
  return (
    <>
      <Button onClick={() => onClick('Error from page')}>
        Click to throw error from a page
      </Button>
      <SubComponent />
    </>
  )
}

Debug.getInitialProps = () => {
  throw new Error('getInitialProps error')
}
