import {Box, Flex, Heading, Stack, Text, Progress} from '@chakra-ui/react'
import {format} from 'd3-format'
import React from 'react'

import {ALink} from './link'
import Bolts from './worker-bolts'

// Round everything above a million
const toSI = format('.4~s')
const roundToSI = (n) => (n < 1000000 ? n : toSI(n))

export default function RunningAnalysis({job, ...p}) {
  const complete = job.complete
  const total = job.total

  return (
    <Stack {...p} p={5} spacing={2}>
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
        {complete > 0 && <Bolts ml={2} workerCount={job.activeWorkers} />}
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
