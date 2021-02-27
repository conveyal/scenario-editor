import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel
} from '@chakra-ui/react'
import without from 'lodash/without'
import {memo} from 'react'

import message from 'lib/message'

import {ModeIcon} from '../mode-icon'

const WALK = 'WALK'
const BICYCLE = 'BICYCLE'
const CAR = 'CAR'
const CAR_PARK = 'CAR_PARK' // pahk your cah in havahd yahd

const BUS = 'BUS'
const RAIL = 'RAIL'
const TRAM = 'TRAM'
const SUBWAY = 'SUBWAY'
const FERRY = 'FERRY'
const CABLE_CAR = 'CABLE_CAR'
const GONDOLA = 'GONDOLA'
const FUNICULAR = 'FUNICULAR'
const ALL = 'ALL'
const ALL_TRANSIT_ARRAY = [
  BUS,
  TRAM,
  RAIL,
  SUBWAY,
  FERRY,
  CABLE_CAR,
  GONDOLA,
  FUNICULAR
]
const ALL_TRANSIT_STRING = ALL_TRANSIT_ARRAY.join(',')

/** Select modes of travel */
export default function ModeSelector({
  accessModes,
  color,
  directModes,
  disabled,
  egressModes,
  transitModes,
  update,
  ...p
}) {
  const _hasTransit = (mode) => transitModes.indexOf(mode) !== -1
  const _hasAllTransit = () =>
    ALL_TRANSIT_ARRAY.map((mode) => transitModes.indexOf(mode) !== -1).every(
      Boolean
    )

  function selectEgressMode(newMode) {
    update({egressModes: newMode})
  }

  const _toggleTransitMode = (mode) => () => {
    let newTransitModes
    if (mode === ALL) {
      newTransitModes = _hasAllTransit() ? '' : ALL_TRANSIT_STRING
    } else {
      newTransitModes = _hasTransit(mode)
        ? without(transitModes.split(','), mode).join(',')
        : [transitModes, mode].filter(Boolean).join(',')
    }

    // park-and-ride requires transit. if it selected when transit is turned
    // off, switch access mode to walk
    const newAccessModes =
      newTransitModes === '' && accessModes === CAR_PARK ? WALK : accessModes

    update({
      accessModes: newAccessModes,
      directModes: newAccessModes,
      transitModes: newTransitModes
    })
  }

  const transit = transitModes !== ''

  return (
    <Flex justify='space-between' {...p}>
      <AccessModeSelector
        color={color}
        hasTransit={transitModes !== ''}
        isDisabled={disabled}
        selectedMode={transit ? accessModes : directModes}
        update={update}
      />
      <FormControl>
        <FormLabel htmlFor='transitModes'>Transit modes</FormLabel>
        <div>
          <ButtonGroup isAttached id='transitModes'>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(ALL)}
              title='All transit'
              variant={_hasAllTransit() ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              All
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(BUS)}
              title={message('mode.bus')}
              variant={_hasTransit(BUS) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={BUS} />
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(TRAM)}
              title={message('mode.tram')}
              variant={_hasTransit(TRAM) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={TRAM} />
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(SUBWAY)}
              title={message('mode.subway')}
              variant={_hasTransit(SUBWAY) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={SUBWAY} />
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(RAIL)}
              title={message('mode.rail')}
              variant={_hasTransit(RAIL) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={RAIL} />
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(FERRY)}
              title={message('mode.ferry')}
              variant={_hasTransit(FERRY) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={FERRY} />
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(CABLE_CAR)}
              title={message('mode.cableCar')}
              variant={_hasTransit(CABLE_CAR) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={CABLE_CAR} />
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(GONDOLA)}
              title={message('mode.gondola')}
              variant={_hasTransit(GONDOLA) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={GONDOLA} />
            </Button>
            <Button
              isDisabled={disabled}
              onClick={_toggleTransitMode(FUNICULAR)}
              title={message('mode.funicular')}
              variant={_hasTransit(FUNICULAR) ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={FUNICULAR} />
            </Button>
          </ButtonGroup>
        </div>
      </FormControl>
      <FormControl>
        <FormLabel pr={0} htmlFor='egressMode'>
          Egress mode
        </FormLabel>
        <div>
          <ButtonGroup id='egressMode' spacing={0}>
            <Button
              isDisabled={!transit || disabled}
              onClick={() => selectEgressMode(WALK)}
              title={`${message('analysis.modes.walk')} egress`}
              variant={transit && egressModes === WALK ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={WALK} />
            </Button>
            <Button
              isDisabled={!transit || disabled}
              onClick={() => selectEgressMode(BICYCLE)}
              title={`${message('analysis.modes.bicycle')} egress`}
              variant={transit && egressModes === BICYCLE ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={BICYCLE} />
            </Button>
          </ButtonGroup>
        </div>
      </FormControl>
    </Flex>
  )
}

type AccessModeSelectorProps = {
  color: string
  hasTransit: boolean
  isDisabled: boolean
  selectedMode: string
  update: (newModes: {accessModes: string; directModes: string}) => void
}

const AccessModeSelector = memo<AccessModeSelectorProps>(
  function AccessModeSelector({
    color,
    hasTransit,
    isDisabled,
    selectedMode,
    update
  }) {
    const _selectAccessMode = (newMode: string) => () => {
      // easiest to just overwrite both. Access mode is used in transit searches
      // and direct mode in non-transit searches; overwriting only one of them
      // however would require additional updates when toggling transit.
      update({
        accessModes: newMode,
        directModes: newMode
      })
    }
    const label = hasTransit ? message('mode.access') : message('mode.direct')
    return (
      <FormControl>
        <FormLabel htmlFor='accessMode'>{label}</FormLabel>
        <div>
          <ButtonGroup id='accessMode' spacing={0}>
            <Button
              isDisabled={isDisabled}
              onClick={_selectAccessMode(WALK)}
              title={`${message('analysis.modes.walk')} ${label}`}
              variant={selectedMode === WALK ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode='WALK' />
            </Button>
            <Button
              isDisabled={isDisabled}
              onClick={_selectAccessMode(BICYCLE)}
              title={`${message('analysis.modes.bicycle')} ${label}`}
              variant={selectedMode === BICYCLE ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={BICYCLE} />
            </Button>
            <Button
              isDisabled={isDisabled}
              onClick={_selectAccessMode(CAR)}
              title={`${message('analysis.modes.car')} ${label}`}
              variant={selectedMode === CAR ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={CAR} />
            </Button>
            <Button
              isDisabled={isDisabled || !hasTransit}
              onClick={_selectAccessMode(CAR_PARK)}
              title={`${message('analysis.modes.carPark')} ${label}`}
              variant={selectedMode === CAR_PARK ? 'solid' : 'ghost'}
              colorScheme={color}
            >
              <ModeIcon mode={CAR_PARK} />
            </Button>
          </ButtonGroup>
        </div>
      </FormControl>
    )
  }
)
