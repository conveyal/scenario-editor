import {Box} from '@chakra-ui/react'
import React from 'react'

export default function Code({children, ...p}) {
  return (
    <Box
      borderRadius='md'
      bg='gray.700'
      color='white'
      fontFamily='mono'
      overflowX='auto'
      p={3}
      userSelect='all'
      whiteSpace='nowrap'
      {...p}
    >
      {children}
    </Box>
  )
}
