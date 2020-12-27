import {Box, Heading, Stack} from '@chakra-ui/core'
import Image from 'next/image'
import React from 'react'

import {LOGO_URL} from 'lib/constants'

const fontFamily = `'Gill Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif`

export default function Logo() {
  return (
    <Stack alignItems='center' isInline spacing={5}>
      <Box>
        <Image src={LOGO_URL} height={48} priority width={48} />
      </Box>
      <Heading
        fontFamily={fontFamily}
        fontSize='36px'
        fontWeight={100}
        letterSpacing={0}
        mt='-8px'
        whiteSpace='nowrap'
      >
        conveyal analysis
      </Heading>
    </Stack>
  )
}
