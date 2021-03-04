import {Stack, Text, Heading} from '@chakra-ui/react'
import get from 'lodash/get'
import sum from 'lodash/sum'
import {useState, useEffect} from 'react'
import {CircleMarker} from 'react-leaflet'
import {useSelector} from 'react-redux'

import colors from 'lib/constants/colors'
import {DEFAULT_SEGMENT_SPEED} from 'lib/constants/timetables'
import message from 'lib/message'
import selectQualifiedStops from 'lib/selectors/qualified-stops-from-segments'
import selectSegments from 'lib/selectors/segments'
import selectSegmentDistances from 'lib/selectors/segment-distances'
import {toPrecision} from 'lib/utils/math'
import {secondsToHhMmSsString} from 'lib/utils/time'

import Collapsible from '../collapsible'
import GeoJSON from '../map/geojson'
import MinutesSeconds from '../minutes-seconds'
import SpeedInput from '../speed'

/**
 * Pass in props directly here since this function is called on new props.
 */
function getNewSegmentSpeeds(segmentDistances, segmentSpeeds) {
  const newLength = segmentDistances.length
  const newSegmentSpeeds = segmentSpeeds.slice(0, newLength)

  // Add new segment speeds using the previous segment speed or the default
  // speed if the previous segment speed is not valid. Usually this will only
  // be when creating the initial segment.
  for (let i = newSegmentSpeeds.length; i < newLength; i++) {
    newSegmentSpeeds.push(segmentSpeeds[i - 1] || DEFAULT_SEGMENT_SPEED)
  }

  return newSegmentSpeeds
}

function getAverageSpeed(segmentDistances, segmentSpeeds) {
  const totalDistance = sum(segmentDistances)
  if (totalDistance === 0) return 0 // avoid dividing by 0
  const weightedSpeeds = segmentSpeeds.map((s, i) => s * segmentDistances[i])
  return (
    weightedSpeeds.reduce((total, speed) => total + speed, 0) / totalDistance
  )
}

function getDwellSeconds(dwellTime, dwellTimes, numberOfStops) {
  let totalSeconds = 0
  for (let i = 0; i < numberOfStops; i++) {
    const customDwellSeconds = get(dwellTimes, i)
    totalSeconds += Number.isFinite(customDwellSeconds)
      ? customDwellSeconds
      : dwellTime
  }
  return totalSeconds
}

function getMovingSeconds(segmentDistances, segmentSpeeds) {
  let totalSeconds = 0
  for (let i = 0; i < segmentDistances.length; i++) {
    const segmentDistance = segmentDistances[i]
    totalSeconds +=
      (segmentDistance / (segmentSpeeds[i] || DEFAULT_SEGMENT_SPEED)) * 60 * 60
  }
  return Math.floor(totalSeconds)
}

export default function SegmentSpeeds({
  dwellTime,
  dwellTimes,
  numberOfStops,
  segmentSpeeds,
  update,
  ...p
}) {
  const segments = useSelector(selectSegments)
  const segmentDistances = useSelector(selectSegmentDistances)
  const qualifiedStops = useSelector(selectQualifiedStops)

  const [highlightSegment, setHighlightSegment] = useState(-1)
  const [highlightStop, setHighlightStop] = useState(-1)
  const [movingSeconds, setMovingSeconds] = useState(0)
  const [dwellSeconds, setDwellSeconds] = useState(0)
  const [segmentSpeedsAreEqual, setSegmentSpeedsAreEqual] = useState(() =>
    segmentSpeeds.every((s) => s === segmentSpeeds[0])
  )
  const totalSeconds = dwellSeconds + movingSeconds

  useEffect(() => {
    // Keep lengths aligned
    if (segmentDistances.length !== segmentSpeeds.length) {
      update({
        segmentSpeeds: getNewSegmentSpeeds(segmentDistances, segmentSpeeds)
      })
    }
    setMovingSeconds(getMovingSeconds(segmentDistances, segmentSpeeds))
    setSegmentSpeedsAreEqual(segmentSpeeds.every((s) => s === segmentSpeeds[0]))
  }, [segmentDistances, segmentSpeeds, update])

  useEffect(() => {
    setDwellSeconds(getDwellSeconds(dwellTime, dwellTimes, numberOfStops))
  }, [dwellTime, dwellTimes, numberOfStops])

  const _setDwellTimeForStop = (index, seconds) => {
    update({
      dwellTimes: qualifiedStops.map((_, i) =>
        i === index ? seconds : get(dwellTimes, i)
      )
    })
  }

  const _setSpeedForSegment = (index, speed) => {
    if (!isNaN(speed) && speed !== 0) {
      const newSpeeds = segmentSpeeds.slice()
      newSpeeds[index] = speed
      update({segmentSpeeds: newSpeeds})
    }
  }

  const _setTimeForSegment = (index, seconds) => {
    if (seconds !== 0) {
      const newSpeeds = segmentSpeeds.slice()
      newSpeeds[index] = segmentDistances[index] / (seconds / 60 / 60)
      update({segmentSpeeds: newSpeeds})
    }
  }

  return (
    <Stack spacing={5} {...p}>
      {highlightSegment > -1 && segments[highlightSegment] != null && (
        <GeoJSON
          color={colors.HIGHLIGHT}
          data={segments[highlightSegment].geometry}
          weight={6}
        />
      )}

      {highlightStop > -1 && qualifiedStops[highlightStop] != null && (
        <CircleMarker
          center={qualifiedStops[highlightStop]}
          fillOpacity={1}
          color={colors.ACTIVE}
          radius={5}
        />
      )}

      <Heading display='flex' size='sm' justifyContent='space-between'>
        <Text>Travel time </Text>
        <Text fontWeight='bolder'>{secondsToHhMmSsString(totalSeconds)}</Text>
      </Heading>

      <Text>
        <em>Dwell time at added stops + moving time along added segments</em>
      </Text>

      <MinutesSeconds
        label={message('modification.dwellTimeDefault')}
        onChange={(dwellTime) => update({dwellTime})}
        seconds={dwellTime}
      />

      <Text>{message('modification.dwellTimeDescription')}</Text>

      {qualifiedStops && (
        <Collapsible
          title={message('modification.addedSegments.individualDwell')}
        >
          <Stack spacing={3}>
            {qualifiedStops.map((_, index) => (
              <MinutesSeconds
                key={`segment-speeds-stop-dwell-time-${index}`}
                label={`Stop ${index}`}
                placeholder={`${secondsToHhMmSsString(dwellTime)} (default)`}
                onBlur={() => setHighlightStop(-1)}
                onChange={(time) => _setDwellTimeForStop(index, time)}
                onFocus={() => setHighlightStop(index)}
                seconds={get(dwellTimes, index)}
              />
            ))}
          </Stack>
        </Collapsible>
      )}

      <AverageSpeed
        segmentDistances={segmentDistances}
        segmentSpeeds={segmentSpeeds}
        segmentSpeedsAreEqual={segmentSpeedsAreEqual}
        setSegmentSpeeds={(segmentSpeeds) => update({segmentSpeeds})}
      />

      <TravelTime
        movingSeconds={movingSeconds}
        segmentDistances={segmentDistances}
        segmentSpeedsAreEqual={segmentSpeedsAreEqual}
        numberOfStops={numberOfStops}
        setSegmentSpeeds={(segmentSpeeds) => update({segmentSpeeds})}
      />

      <Collapsible
        title={message('modification.addedSegments.individualSpeed')}
      >
        <Stack spacing={4}>
          {segmentSpeeds.map((speed, index) => (
            <Stack key={index}>
              <SpeedInput
                label={`Segment ${index + 1} speed`}
                onBlur={() => setHighlightSegment(-1)}
                onChange={(speed) => _setSpeedForSegment(index, speed)}
                onFocus={() => setHighlightSegment(index)}
                speed={speed}
              />
              <MinutesSeconds
                label={`Segment ${index + 1} duration`}
                placeholder={message('modification.time')}
                onBlur={() => setHighlightSegment(-1)}
                onChange={(time) => _setTimeForSegment(index, time)}
                onFocus={() => setHighlightSegment(index)}
                seconds={(segmentDistances[index] / speed) * 60 * 60}
              />
            </Stack>
          ))}
        </Stack>
      </Collapsible>
    </Stack>
  )
}

function AverageSpeed({
  segmentDistances,
  segmentSpeeds,
  segmentSpeedsAreEqual,
  setSegmentSpeeds,
  ...p
}) {
  const [averageSpeed, setAverageSpeed] = useState(DEFAULT_SEGMENT_SPEED)
  useEffect(() => {
    setAverageSpeed(getAverageSpeed(segmentDistances, segmentSpeeds))
  }, [segmentDistances, segmentSpeeds])

  const [confirmedSetAllSpeedsOnce, setConfirmedSetAllSpeedsOnce] = useState(
    false
  )
  function _confirmedSetAllSpeedsOnce() {
    if (!confirmedSetAllSpeedsOnce) {
      const confirmed = window.confirm(
        `${message('modification.addedSegments.confirmSpeedChange')}`
      )
      setConfirmedSetAllSpeedsOnce(confirmed)
      return confirmed
    }

    return !!confirmedSetAllSpeedsOnce
  }

  function _setAllSegmentSpeedsTo(newSpeed) {
    if (
      !isNaN(newSpeed) &&
      (segmentSpeedsAreEqual || _confirmedSetAllSpeedsOnce())
    ) {
      setSegmentSpeeds(segmentSpeeds.map(() => newSpeed))
    }
  }

  return (
    <SpeedInput
      {...p}
      label={message('modification.addedSegments.speed')}
      onChange={_setAllSegmentSpeedsTo}
      speed={toPrecision(averageSpeed)}
    />
  )
}

function TravelTime({
  movingSeconds,
  numberOfStops,
  segmentDistances,
  segmentSpeedsAreEqual,
  setSegmentSpeeds,
  ...p
}) {
  const [
    confirmedSetSpeedFromTravelTimeOnce,
    setConfirmedSetSpeedFromTravelTimeOnce
  ] = useState(false)
  function _confirmedSetSpeedFromTravelTimeOnce() {
    if (!confirmedSetSpeedFromTravelTimeOnce) {
      const confirmed = window.confirm(
        `${message('modification.addedSegments.confirmTimeChange')}`
      )
      setConfirmedSetSpeedFromTravelTimeOnce(confirmed)
      return confirmed
    }

    return !!confirmedSetSpeedFromTravelTimeOnce
  }

  function _setSpeedFromTravelTime(travelTimeSeconds) {
    if (
      travelTimeSeconds !== 0 &&
      (segmentSpeedsAreEqual || _confirmedSetSpeedFromTravelTimeOnce())
    ) {
      // figure out appropriate speed given this travel time
      if (numberOfStops !== 0) {
        const totalKilometers = sum(segmentDistances)
        // figure out speed
        const speedKps =
          travelTimeSeconds >= 1
            ? totalKilometers / travelTimeSeconds
            : totalKilometers
        const speedKph = speedKps * 3600
        setSegmentSpeeds(segmentDistances.map(() => speedKph))
      }
    }
  }

  return (
    <MinutesSeconds
      {...p}
      label='Total moving time (along added segments)'
      onChange={_setSpeedFromTravelTime}
      seconds={movingSeconds}
    />
  )
}
