import {Flex, Heading, Stack, Divider} from '@chakra-ui/react'
import get from 'lodash/get'
import {useState} from 'react'
import {useSelector} from 'react-redux'

import colors from 'lib/constants/colors'
import message from 'lib/message'
import * as reroute from 'lib/utils/update-add-stops-terminus'

import selectStopsFromModification from 'lib/selectors/stops-from-modification'

import IconButton from '../icon-button'
import {CrosshairsIcon, XIcon} from '../icons'
import RerouteLayer from '../modifications-map/reroute-layer'
import StopLayer from '../modifications-map/stop-layer'

import EditAlignment from './edit-alignment'
import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SegmentSpeeds from './segment-speeds'

/**
 * Reroute or extend an existing line.
 *
 * A reroute is specified with both a fromStop and toStop. Stops between those
 * stops in the baseline pattern will be replaced by the stops added through the
 * edit alignment functions in the transit editor. In the transit editor,
 * allowExtend is set to false, because the start and end of the reroute are
 * already set by fromStop and toStop.
 *
 * An extension is specified with either a fromStop or toStop. Stops added
 * through the edit alignment functions in transit editor will be
 * added to the baseline pattern. If fromStop is set, extendFromEnd is set to
 * true, and stops are appended to the end of the baseline pattern. If
 * toStop is set, extendFromEnd is set to false, and stops are prepended to
 * the beginning of the baseline pattern. In both cases, allowExtend is true.
 */
export default function Reroute({
  modification,
  selectedFeed,
  update,
  updateAndRetrieveFeedData
}) {
  const stops = useSelector(selectStopsFromModification)
  const [selectStop, setSelectStop] = useState('none')
  const [isEditing, setIsEditing] = useState(false)

  const onSelectStop = (s) => {
    if (selectStop === 'fromStop') {
      update({
        fromStop: s.stop_id,
        segments: reroute.segmentsFromStop(
          s,
          get(modification, 'segments', []),
          `${get(modification, 'feed')}:${s.stop_id}`
        )
      })
    } else if (selectStop === 'toStop') {
      update({
        toStop: s.stop_id,
        segments: reroute.segmentsToStop(
          s,
          get(modification, 'segments', []),
          `${get(modification, 'feed')}:${s.stop_id}`
        )
      })
    }
    setSelectStop('none')
  }

  const _clearFromStop = () => {
    update({
      fromStop: null,
      toStop: modification.segments.length === 1 ? null : modification.toStop,
      segments: modification.segments.slice(1)
    })

    setSelectStop('none')
  }

  const _clearToStop = () => {
    update({
      fromStop:
        modification.segments.length === 1 ? null : modification.fromStop,
      toStop: null,
      segments: modification.segments.slice(0, -1)
    })

    // Clear map state when editing alignments/selecting a stop.
    setSelectStop('none')
  }

  const hasFeedRoutesAndTrips =
    selectedFeed &&
    modification.routes &&
    (modification.trips === null || get(modification, 'trips.length') > 0)
  const fromStopValue = get(
    selectedFeed,
    `stopsById[${modification.fromStop}].stop_name`,
    '(none)'
  )
  const toStopValue = get(
    selectedFeed,
    `stopsById[${modification.toStop}].stop_name`,
    '(none)'
  )

  let numberOfStops = stops.length

  // don't include dwells at first and last stops
  if (modification.fromStop) numberOfStops--
  if (modification.toStop) numberOfStops--

  return (
    <Stack spacing={4}>
      <RerouteLayer
        feed={selectedFeed}
        isEditing={isEditing}
        modification={modification}
      />

      {selectStop !== 'none' && (
        <StopLayer
          feed={selectedFeed}
          modification={modification}
          onSelect={onSelectStop}
          selectedColor={colors.ACTIVE}
          unselectedColor={colors.NEUTRAL}
        />
      )}

      <SelectFeedRouteAndPatterns
        onChange={updateAndRetrieveFeedData}
        routes={modification.routes}
        trips={modification.trips}
      />

      {hasFeedRoutesAndTrips && (
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Heading size='sm'>
              {message('transitEditor.fromStopLabel')}
            </Heading>
            <Flex justify='space-between' alignItems='center'>
              <Heading size='sm'>{fromStopValue}</Heading>
              <Flex>
                <IconButton
                  isDisabled={isEditing}
                  label='Select from stop'
                  onClick={() => setSelectStop('fromStop')}
                  size='md'
                  colorScheme='blue'
                >
                  <CrosshairsIcon />
                </IconButton>
                {modification.fromStop != null && (
                  <IconButton
                    isDisabled={isEditing}
                    label='Clear from stop'
                    onClick={_clearFromStop}
                    size='md'
                    colorScheme='red'
                  >
                    <XIcon />
                  </IconButton>
                )}
              </Flex>
            </Flex>

            <Divider />

            <Heading size='sm'>{message('transitEditor.toStopLabel')}</Heading>
            <Flex justify='space-between' alignItems='center'>
              <Heading size='sm'>{toStopValue}</Heading>
              <Flex>
                <IconButton
                  isDisabled={isEditing}
                  label='Select to stop'
                  onClick={() => setSelectStop('toStop')}
                  size='md'
                  colorScheme='blue'
                >
                  <CrosshairsIcon />
                </IconButton>
                {modification.toStop != null && (
                  <IconButton
                    isDisabled={isEditing}
                    label='Clear to stop'
                    onClick={_clearToStop}
                    size='md'
                    colorScheme='red'
                  >
                    <XIcon />
                  </IconButton>
                )}
              </Flex>
            </Flex>

            <Divider />
          </Stack>

          {modification.segments.length > 0 && (
            <EditAlignment
              isEditing={isEditing}
              modification={modification}
              setIsEditing={setIsEditing}
              update={update}
            />
          )}

          {modification.segments.length > 0 && (
            <SegmentSpeeds
              dwellTime={modification.dwellTime}
              dwellTimes={modification.dwellTimes}
              numberOfStops={numberOfStops}
              segmentSpeeds={modification.segmentSpeeds}
              update={update}
            />
          )}
        </Stack>
      )}
    </Stack>
  )
}
