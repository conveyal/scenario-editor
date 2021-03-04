import {
  Alert,
  AlertIcon,
  Button,
  Checkbox,
  Heading,
  Stack,
  Text
} from '@chakra-ui/react'
import {FaCircle, FaRegCircle, FaStopCircle} from 'react-icons/fa'
import get from 'lodash/get'
import {useState} from 'react'
import {useSelector} from 'react-redux'

import {
  ADD_TRIP_PATTERN,
  DEFAULT_STOP_SPACING_METERS,
  MINIMUM_STOP_SPACING,
  REROUTE
} from 'lib/constants'
import colors from 'lib/constants/colors'
import message from 'lib/message'
import selectSegmentDistances from 'lib/selectors/segment-distances'
import selectAllStops from 'lib/selectors/stops-from-all-feeds'
import getExistingStopsAlongPattern from 'lib/utils/get-existing-stops-along-pattern'

import {EditIcon} from '../icons'
import GTFSStopGridLayer from '../modifications-map/gtfs-stop-gridlayer'
import TransitEditor from '../modifications-map/transit-editor'
import NumberInput from '../number-input'
import * as Panel from '../panel'

const isValidStopSpacing = (s) => s >= MINIMUM_STOP_SPACING

export default function EditAlignment({
  isEditing,
  modification,
  numberOfStops = 0,
  setIsEditing,
  update,
  ...p
}) {
  const allStops = useSelector(selectAllStops)
  const segmentDistances = useSelector(selectSegmentDistances)
  const [spacing, setSpacing] = useState(
    get(modification, 'segments[0].spacing', 0)
  )

  const [allowExtend, setAllowExtend] = useState(true)
  const [extendFromEnd, setExtendFromEnd] = useState(true)
  const [followRoad, setFollowRoad] = useState(false)
  const createStopsAutomatically = spacing > 0

  function getSegments() {
    return [...(modification.segments || [])]
  }

  // TODO move into an action
  function autoGen() {
    const newSegments = getExistingStopsAlongPattern(getSegments(), allStops)
    update({segments: newSegments})
  }

  /**
   * Toggle whether a pattern is bidirectional.
   */
  function onBidirectionalChange(e) {
    update({bidirectional: e.target.checked})
  }

  /**
   * Toggle whether stops should be created automatically.
   */
  function onAutoCreateStopsChange(e) {
    const spacing = e.target.checked ? DEFAULT_STOP_SPACING_METERS : 0

    // Store in map state
    setSpacing(spacing)

    if (get(modification, 'segments.length') > 0) {
      update({
        segments: modification.segments.map((segment) => ({
          ...segment,
          spacing
        }))
      })
    }
  }

  /**
   * Set stop spacing
   */
  function onStopSpacingChange(spacing) {
    const {segments} = modification

    setSpacing(spacing)

    // only set stop spacing if current spacing is not zero
    if (get(segments, '[0].spacing') > 0) {
      update({segments: segments.map((segment) => ({...segment, spacing}))})
    }
  }

  const hasAnyPhasing = !!get(modification, 'timetables', []).find(
    (t) => t.phaseAtStop != null
  )

  const distance = segmentDistances.reduce(
    (accumulatedDistance, currentDistance) => {
      return accumulatedDistance + currentDistance
    },
    0
  )

  return (
    <Stack spacing={4} {...p}>
      {isEditing && (
        <>
          <GTFSStopGridLayer stops={allStops} />
          <TransitEditor
            allowExtend={
              modification.type === REROUTE
                ? modification.toStop == null || modification.fromStop == null
                : allowExtend
            }
            allStops={allStops}
            extendFromEnd={extendFromEnd}
            followRoad={followRoad}
            modification={modification}
            spacing={spacing}
            updateModification={update}
          />
        </>
      )}

      <Heading size='sm'>Route Geometry</Heading>
      {distance === 0 && modification.type === ADD_TRIP_PATTERN && (
        <Alert status='error'>
          <AlertIcon /> A route geometry must have at least 2 stops
        </Alert>
      )}

      {distance > 0 &&
        modification.type === ADD_TRIP_PATTERN &&
        numberOfStops > 0 && (
          <Text>{`${numberOfStops} stops over ${
            Math.round(distance * 100) / 100
          } km`}</Text>
        )}

      {!isEditing ? (
        <Button
          isFullWidth
          leftIcon={<EditIcon />}
          onClick={() => setIsEditing(true)}
          colorScheme='yellow'
        >
          {message('transitEditor.startEdit')}
        </Button>
      ) : (
        <Button
          isFullWidth
          leftIcon={<FaStopCircle />}
          onClick={() => setIsEditing(false)}
          colorScheme='yellow'
        >
          {message('transitEditor.stopEdit')}
        </Button>
      )}

      {isEditing && distance > 0 && (
        <Button
          leftIcon={<FaCircle />}
          isFullWidth
          onClick={autoGen}
          colorScheme='yellow'
        >
          {message('transitEditor.snap')}
        </Button>
      )}

      {distance > 0 && (
        <Checkbox
          fontWeight='normal'
          isChecked={createStopsAutomatically}
          onChange={onAutoCreateStopsChange}
        >
          {message('transitEditor.autoCreateStops')}
        </Checkbox>
      )}

      {createStopsAutomatically && (
        <NumberInput
          label={message('transitEditor.stopSpacingMeters')}
          onChange={onStopSpacingChange}
          test={isValidStopSpacing}
          units='meters'
          value={spacing}
        />
      )}

      {modification.type !== REROUTE && distance > 0 && (
        <Checkbox
          fontWeight='normal'
          isChecked={modification.bidirectional}
          isDisabled={hasAnyPhasing}
          onChange={onBidirectionalChange}
        >
          {message('transitEditor.bidirectional')}
        </Checkbox>
      )}

      {hasAnyPhasing && (
        <Alert status='info'>
          {message('transitEditor.bidirectionalWarning')}
        </Alert>
      )}

      {isEditing && (
        <Checkbox
          fontWeight='normal'
          isChecked={followRoad}
          onChange={(e) => setFollowRoad(e.target.checked)}
        >
          {message('transitEditor.followRoad')}
        </Checkbox>
      )}

      {modification.type !== REROUTE && isEditing && (
        <Checkbox
          fontWeight='normal'
          isChecked={allowExtend}
          onChange={(e) => setAllowExtend(e.target.checked)}
        >
          {message('transitEditor.extend')}
        </Checkbox>
      )}

      {modification.type !== REROUTE && isEditing && allowExtend && (
        <Checkbox
          fontWeight='normal'
          isChecked={extendFromEnd}
          onChange={(e) => setExtendFromEnd(e.target.checked)}
        >
          {message('transitEditor.extendFromEnd')}
        </Checkbox>
      )}

      {isEditing && (
        <Panel.Panel>
          <Panel.Heading>
            <strong>
              {message(
                'transitEditor.instructionsTitle',
                'Editing Instructions'
              )}
            </strong>
          </Panel.Heading>
          <Panel.Body>
            <Stack>
              <Text>{message('transitEditor.instructions')}</Text>
              <Text>
                <strong>Symbology</strong>
              </Text>
              <Text>
                <FaRegCircle
                  style={{
                    color: colors.NEUTRAL,
                    display: 'inline',
                    opacity: 0.5
                  }}
                />{' '}
                {message('transitEditor.existingStops')}
              </Text>
              <Text>
                <FaRegCircle
                  style={{color: colors.ADDED, display: 'inline-block'}}
                />{' '}
                {message('transitEditor.newStopDescription')}
              </Text>
              <Text>
                <FaRegCircle
                  style={{
                    color: colors.ADDED,
                    display: 'inline-block',
                    opacity: 0.5
                  }}
                />{' '}
                {message('transitEditor.autocreatedStopDescription')}
              </Text>
              <Text>
                <FaRegCircle style={{display: 'inline-block'}} />{' '}
                {message('transitEditor.snappedStopDescription')}
              </Text>
              <Text>
                <FaCircle
                  style={{color: colors.ADDED, display: 'inline-block'}}
                />{' '}
                {message('transitEditor.controlPointDescription')}
              </Text>
            </Stack>
          </Panel.Body>
        </Panel.Panel>
      )}
    </Stack>
  )
}
