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
export default function Modification(p: {
  bundle: CL.Bundle
  modification: CL.Modification
  index: number
  total: number
}) {
  const {type} = p.modification

  return (
    <Stack
      borderBottomWidth='1px'
      pb={8}
      spacing={2}
      style={{pageBreakBefore: 'always'}}
    >
      <Flex justify='space-between'>
        <Heading size='md'>{p.modification.name}</Heading>
        <Box>
          ({p.index} / {p.total}) {message(`modificationType.${type}`) || type}
        </Box>
      </Flex>

      {p.modification.description && <Box>{p.modification.description}</Box>}

      <Box>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {type === CONVERT_TO_FREQUENCY && (
            <AdjustFrequency
              {...p}
              modification={p.modification as CL.ConvertToFrequency}
            />
          )}
          {type === ADD_TRIP_PATTERN && (
            <AddTrips
              {...p}
              modification={p.modification as CL.AddTripPattern}
            />
          )}
          {type === REMOVE_TRIPS && (
            <RemoveTrips
              {...p}
              modification={p.modification as CL.RemoveTrips}
            />
          )}
          {type === REMOVE_STOPS && (
            <RemoveStops
              {...p}
              modification={p.modification as CL.RemoveStops}
            />
          )}
          {type === REROUTE && (
            <Reroute {...p} modification={p.modification as CL.Reroute} />
          )}
          {type === ADJUST_DWELL_TIME && (
            <AdjustDwellTime
              {...p}
              modification={p.modification as CL.AdjustDwellTime}
            />
          )}
          {type === ADJUST_SPEED && (
            <AdjustSpeed
              {...p}
              modification={p.modification as CL.AdjustSpeed}
            />
          )}
        </ErrorBoundary>
      </Box>
    </Stack>
  )
}
