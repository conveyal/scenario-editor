import {ChakraProvider, theme} from '@chakra-ui/react'
import React from 'react'

const ConveyalTheme: Partial<typeof theme> = {
  ...theme,
  fonts: {
    ...theme.fonts,
    body: `'Inter', -apple-system, 'Segoe UI', sans-serif`
  },
  fontWeights: {
    ...theme.fontWeights,
    normal: 400,
    medium: 400,
    bold: 600
  }
}

export default function ChakraTheme({children}) {
  return <ChakraProvider theme={ConveyalTheme}>{children}</ChakraProvider>
}
