import {Box} from '@chakra-ui/react'
import React from 'react'

import {BoltIcon} from './icons'
import Tip from './tip'

const boltActive = {color: 'orange', display: 'inline-block', marginLeft: '2px'}
const Bolt = () => <BoltIcon style={boltActive} />

export default function WorkerBolts({workerCount, ...p}) {
  const workerText = `${workerCount} cloud worker(s) processing this job`

  return (
    <Box {...p}>
      <Tip placement='left' label={workerText} borderRadius='2px'>
        <Box whiteSpace='nowrap'>
          {workerCount > 0 && <Bolt />}
          {workerCount > 1 && <Bolt />}
          {workerCount > 10 && <Bolt />}
          {workerCount > 100 && <Bolt />}
          {workerCount > 1000 && <Bolt />}
        </Box>
      </Tip>
    </Box>
  )
}
