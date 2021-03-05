import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  Stack
} from '@chakra-ui/react'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from 'lib/constants'
import message from 'lib/message'

import AdjustFrequency from './adjust-frequency'
import AddTrips from './add-trips'
import RemoveTrips from './remove-trips'
import RemoveStops from './remove-stops'
import Reroute from './reroute'
import AdjustDwellTime from './adjust-dwell-time'
import AdjustSpeed from './adjust-speed'

function ErrorFallback({error}) {
  return (
    <Alert status='error'>
      <AlertIcon />
      <Stack>
        <AlertTitle>Error rendering modification</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Stack>
    </Alert>
  )
}

/** A Modification in a report */
export default function Modification(props) {
  const {modification, index, total} = props
  const {type} = modification

  return (
    <Stack
      borderBottomWidth='1px'
      pb={8}
      spacing={2}
      style={{pageBreakBefore: 'always'}}
    >
      <Flex justify='space-between'>
        <Heading size='md'>{modification.name}</Heading>
        <Box>
          ({index} / {total}) {message(`modificationType.${type}`) || type}
        </Box>
      </Flex>

      {modification.description && <Box>{modification.description}</Box>}

      <Box>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {type === CONVERT_TO_FREQUENCY && <AdjustFrequency {...props} />}
          {type === ADD_TRIP_PATTERN && <AddTrips {...props} />}
          {type === REMOVE_TRIPS && <RemoveTrips {...props} />}
          {type === REMOVE_STOPS && <RemoveStops {...props} />}
          {type === REROUTE && <Reroute {...props} />}
          {type === ADJUST_DWELL_TIME && <AdjustDwellTime {...props} />}
          {type === ADJUST_SPEED && <AdjustSpeed {...props} />}
        </ErrorBoundary>
      </Box>
    </Stack>
  )
}
