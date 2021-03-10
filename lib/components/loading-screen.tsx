import {Center, VStack} from '@chakra-ui/react'

import Logo from './logo'
import Spinner from './spinner'

export default function LoadingScreen() {
  return (
    <Center height='100vh'>
      <VStack spacing={6} mt='-72px'>
        <Logo />
        <h1 style={{color: '#2389c9', fontSize: '36px'}}>
          <Spinner />
        </h1>
      </VStack>
    </Center>
  )
}
