import {Box, Heading} from '@chakra-ui/react'
import React from 'react'

import InnerDock from 'lib/components/inner-dock'

export default function ODHeading(p) {
  return (
    <InnerDock>
      <Box p={4}>
        <Heading mb={4} size='md'>
          Spatial Datasets
        </Heading>

        {p.children}
      </Box>
    </InnerDock>
  )
}
