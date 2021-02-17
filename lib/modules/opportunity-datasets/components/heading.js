import {Box, Heading} from '@chakra-ui/core'
import {faTh} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import Icon from 'lib/components/icon'
import InnerDock from 'lib/components/inner-dock'

export default function ODHeading(p) {
  return (
    <InnerDock>
      <Box p={4}>
        <Heading mb={4} size='md'>
          <Icon icon={faTh} /> Spatial Datasets
        </Heading>

        {p.children}
      </Box>
    </InnerDock>
  )
}
