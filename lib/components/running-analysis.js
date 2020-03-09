import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Tooltip,
  Progress
} from '@chakra-ui/core'
import {faBolt} from '@fortawesome/free-solid-svg-icons'
import {format} from 'd3-format'
import React from 'react'

import Icon from './icon'
import {ALink} from './link'

// Round everything above a million
const toSI = format('.4~s')
const roundToSI = n => (n < 1000000 ? n : toSI(n))

const boltActive = {color: 'orange'}
const Bolt = () => (
  <>
    &nbsp;
    <Icon fixedWidth={false} icon={faBolt} style={boltActive} />
  </>
)

export default function RunningAnalysis({job, ...p}) {
  const complete = job.complete
  const total = job.total
  const nWorkers = job.activeWorkers
  const workerText = `${nWorkers} cloud worker(s) processing this job`

  return (
    <Stack {...p} border='1px solid #ddd' borderRadius='4px' p={4} spacing={2}>
      <Flex align='flex-start' justify='space-between'>
        <Heading size='sm'>
          <ALink
            analysisId={job.jobId}
            regionId={job.regionalAnalysis.regionId}
            to='regionalAnalyses'
          >
            {job.regionalAnalysis.name}
          </ALink>
        </Heading>
        {complete > 0 && (
          <Tooltip
            hasArrow
            placement='left'
            label={workerText}
            borderRadius='2px'
          >
            <Box ml={2} whiteSpace='nowrap'>
              {nWorkers > 0 && <Bolt />}
              {nWorkers > 1 && <Bolt />}
              {nWorkers > 10 && <Bolt />}
              {nWorkers > 100 && <Bolt />}
              {nWorkers > 1000 && <Bolt />}
            </Box>
          </Tooltip>
        )}
      </Flex>
      <Flex justify='space-between'>
        <Box>{job.statusText}</Box>
        <Text textAlign='right'>
          {roundToSI(complete)} / {roundToSI(total)} origins
        </Text>
      </Flex>
      <Progress
        borderRadius='2px'
        hasStripe
        isAnimated
        value={(complete / total) * 100}
      />
    </Stack>
  )
}
