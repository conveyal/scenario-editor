import {Box, BoxProps, forwardRef} from '@chakra-ui/react'

import {CB_HEX, CB_DARK} from '../constants'

const ALink = forwardRef<BoxProps, 'a'>(({children, ...p}, ref) => {
  return (
    <Box as='a' color={CB_HEX} _hover={{color: CB_DARK}} ref={ref} {...p}>
      {children}
    </Box>
  )
})

export default ALink
