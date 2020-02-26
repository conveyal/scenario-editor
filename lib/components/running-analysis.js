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
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import React from 'react'

import Icon from './icon'

// Round everything above a million
const toSI = format('.4~s')
const roundToSI = n => (n < 1000000 ? n : toSI(n))

// [job.id]: {time, averageMsPerTask}
const jobTimes = {}

/**
 * Predict the time remaining.
 */
function predictTimeRemaining(id, complete, total, createdAt) {
  const time = Date.now()

  const remainingTasks = total - complete
  let msPerTask = (time - createdAt) / complete
  let count = 1
  const previousRecord = jobTimes[id]
  if (previousRecord) {
    const completed = complete - previousRecord.complete
    const elapsedMs = time - previousRecord.time
    count = previousRecord.count + 1

    const currentMsPerTask = elapsedMs / completed
    msPerTask = (previousRecord.msPerTask + currentMsPerTask) / 2
  }

  // Ensure no NaNs
  if (isNaN(msPerTask)) msPerTask = 1000
  // Store record
  jobTimes[id] = {complete, count, msPerTask, time}

  console.log(jobTimes[id])

  const timeRemainingMs = msPerTask * remainingTasks
  if (!isNaN(timeRemainingMs) && isFinite(timeRemainingMs)) {
    return (
      formatDistanceToNow(new Date(Date.now() + timeRemainingMs)) + ' remaining'
    )
  } else {
    return 'calculating time remaining...'
  }
}

const boltActive = {color: 'orange'}
const boltInactive = {color: '#fff'}

export default function RunningAnalysis({job, ...p}) {
  const complete = job.complete
  const total = job.total
  const id = job.jobId
  const createdAt = job.regionalAnalysis.createdAt
  const [timeRemaining, setTimeRemaining] = React.useState(
    'calculating time remaining...'
  )
  React.useEffect(() => {
    setTimeRemaining(predictTimeRemaining(id, complete, total, createdAt))
  }, [complete, createdAt, id, total])

  const nWorkers = job.activeWorkers
  const workerText = `${nWorkers} cloud worker(s) processing this job`

  return (
    <Stack {...p} border='1px solid #ddd' borderRadius='4px' p={4} spacing={2}>
      <Flex align='flex-start' justify='space-between'>
        <Heading size='sm'>{job.regionalAnalysis.name}</Heading>
        <Tooltip
          hasArrow
          placement='left'
          label={workerText}
          borderRadius='2px'
        >
          <Box
            p={1}
            backgroundColor='#333'
            borderRadius='2px'
            ml={2}
            whiteSpace='nowrap'
          >
            <Icon
              icon={faBolt}
              style={nWorkers > 0 ? boltActive : boltInactive}
            />
            <Icon
              icon={faBolt}
              style={nWorkers >= 10 ? boltActive : boltInactive}
            />
            <Icon
              icon={faBolt}
              style={nWorkers >= 100 ? boltActive : boltInactive}
            />
          </Box>
        </Tooltip>
      </Flex>
      <Flex justify='space-between'>
        <Box>
          {complete === total
            ? 'assembling results...'
            : complete === 0
            ? 'starting cluster...'
            : timeRemaining}
        </Box>
        <Text>
          {roundToSI(complete)} / {roundToSI(total)}
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
