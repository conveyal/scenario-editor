import {Box, Heading, Stack} from '@chakra-ui/react'
import Image from 'next/image'

import {LOGO_URL} from 'lib/constants'

export default function Logo() {
  return (
    <Stack alignItems='center' isInline spacing={5}>
      <Box>
        <Image
          alt='Conveyal Logo'
          src={LOGO_URL}
          height={48}
          priority
          width={48}
        />
      </Box>
      <Heading
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
