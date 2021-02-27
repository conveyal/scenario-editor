import {Stack} from '@chakra-ui/react'
import {CSSProperties} from 'react'

import Logo from './logo'
import Spinner from './spinner'

const style: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: '50%',
  marginTop: '-15%',
  textAlign: 'center'
}

export default function LoadingScreen() {
  return (
    <Stack alignItems='center' style={style}>
      <Logo />
      <h1 style={{color: '#2389c9', fontSize: '36px'}}>
        <Spinner />
      </h1>
    </Stack>
  )
}
