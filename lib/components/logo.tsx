import {Box, HStack} from '@chakra-ui/react'

import SVGLogo from './logo.svg'

export default function Logo() {
  return (
    <HStack alignContent='center' spacing={4}>
      <Box boxSize='60px'>
        <SVGLogo />
      </Box>
      <Box>
        <Box
          fontSize='3rem'
          fontWeight={300}
          letterSpacing='-0.15rem'
          mt='-0.35rem'
        >
          conveyal
        </Box>
      </Box>
    </HStack>
  )
}
