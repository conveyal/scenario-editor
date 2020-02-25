import {
  Box,
  Divider,
  Flex,
  Heading,
  Stack,
  Text,
  Textarea,
  Progress
} from '@chakra-ui/core'
import {
  faBolt,
  faClock,
  faMapPin,
  faSatelliteDish,
  faStopwatch
} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import Icon from '../icon'
import ProgressBar from '../progress-bar'

const jobTimes = {}

function getTimeRemaining(job) {}

// TODO show remaining time at the top
// TODO show one "bolt" if < 10 servers running, 2 bolts if < 100, and 3 if > 100

export default function RunningAnalysis({job, ...p}) {
  const complete = job.complete
  const total = job.total
  return (
    <Stack {...p} border='1px solid #eee' borderRadius='4px' p={4} spacing={4}>
      <Heading size='md'>{job.regionalAnalysis.name}</Heading>
      <Box>
        {job.activeWorkers > 0 ? (
          <Stack spacing={4}>
            <Flex justify='space-between'>
              <Text>
                <Icon fixedWidth={false} icon={faMapPin} /> origins
              </Text>
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
            <Text>
              <Icon icon={faBolt} /> {job.activeWorkers * 250} cloud server(s)
              working
            </Text>
            <Text>
              <Icon icon={faStopwatch} /> Time remaining...
            </Text>
          </Stack>
        ) : (
          <Text>
            <Icon icon={faSatelliteDish} /> initializing server cluster...
          </Text>
        )}
      </Box>
    </Stack>
  )
}
