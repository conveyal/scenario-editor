import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Tooltip,
  Progress
} from '@chakra-ui/core'
import {
  faBolt,
  faClock,
  faMapPin,
  faSatelliteDish,
  faStopwatch
} from '@fortawesome/free-solid-svg-icons'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import React from 'react'
import {addToMean} from 'simple-statistics'

import Icon from './icon'

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
    msPerTask = addToMean(previousRecord.msPerTask, count, currentMsPerTask)
  }

  const timeRemainingMs = msPerTask * remainingTasks
  // Store record
  jobTimes[id] = {complete, count, msPerTask, time}

  if (!isNaN(timeRemainingMs)) {
    return (
      formatDistanceToNow(new Date(Date.now() + timeRemainingMs)) + ' remaining'
    )
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
        <Tooltip hasArrow placement='left' label={workerText}>
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
          {job.complete} / {job.total}
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
