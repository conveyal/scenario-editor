import {CSSReset, ThemeProvider, theme, ITheme} from '@chakra-ui/core'
import React from 'react'

const ConveyalTheme: ITheme = {
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
  return (
    <ThemeProvider theme={ConveyalTheme}>
      <CSSReset />
      {children}
    </ThemeProvider>
  )
}
