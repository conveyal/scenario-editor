import {Box, Tooltip} from '@chakra-ui/core'
import {faBolt} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import Icon from './icon'

const boltActive = {color: 'orange'}
const Bolt = () => (
  <>
    &nbsp;
    <Icon fixedWidth={false} icon={faBolt} style={boltActive} />
  </>
)

export default function WorkerBolts({workerCount, ...p}) {
  const workerText = `${workerCount} cloud worker(s) processing this job`

  return (
    <Box {...p}>
      <Tooltip hasArrow placement='left' label={workerText} borderRadius='2px'>
        <Box whiteSpace='nowrap'>
          {workerCount > 0 && <Bolt />}
          {workerCount > 1 && <Bolt />}
          {workerCount > 10 && <Bolt />}
          {workerCount > 100 && <Bolt />}
          {workerCount > 1000 && <Bolt />}
        </Box>
      </Tooltip>
    </Box>
  )
}
