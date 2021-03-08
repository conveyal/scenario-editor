import {
  ChakraProvider,
  cookieStorageManager,
  extendTheme,
  localStorageManager
} from '@chakra-ui/react'

const defaultFontFamily = `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`

// Lighten font weight
const Button = {
  baseStyle: {
    fontWeight: 'normal'
  }
}

const ConveyalTheme = extendTheme({
  components: {
    Button
  },
  fonts: {
    body: defaultFontFamily,
    heading: defaultFontFamily
  },
  initialColorMode: 'light',
  radii: {
    sm: '0.0625.rem',
    base: '0.125rem',
    md: '0.25rem'
  },
  styles: {
    global: {
      html: {
        fontSize: '12px'
      },
      a: {
        cursor: 'pointer',
        color: 'blue.600',
        textDecoration: 'none',
        _hover: {
          color: 'blue.700',
          outline: 'none'
        },
        _active: {
          color: 'blue.700',
          outline: 'none'
        }
      },
      '*': {
        textAlign: 'left'
      }
    }
  },
  useSystemColorMode: false
})

export default function ChakraTheme({cookies, children}) {
  const colorModeManager =
    typeof cookies === 'string'
      ? cookieStorageManager(cookies)
      : localStorageManager
  return (
    <ChakraProvider colorModeManager={colorModeManager} theme={ConveyalTheme}>
      {children}
    </ChakraProvider>
  )
}
