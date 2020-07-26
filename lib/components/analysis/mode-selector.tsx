import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel
} from '@chakra-ui/core'
import {
  faBicycle,
  faBus,
  faWalking,
  faShip,
  faSubway,
  faTrain
} from '@fortawesome/free-solid-svg-icons'
import message from 'lib/message'
import without from 'lodash/without'

import ModeIcon from '../mode-icon'
import Icon from '../icon'

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

  const _selectAccessMode = (newMode) => () => {
    // easiest to just overwrite both. Access mode is used in transit searches
    // and direct mode in non-transit searches; overwriting only one of them
    // however would require additional updates when toggling transit.
    update({
      accessModes: newMode,
      directModes: newMode
    })
  }

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
  const nonTransitMode = transit ? accessModes : directModes

  return (
    <Flex justify='space-between' {...p}>
      <FormControl>
        <FormLabel htmlFor='accessMode'>
          {transit ? message('mode.access') : message('mode.direct')}
        </FormLabel>
        <Box>
          <ButtonGroup isAttached id='accessMode'>
            <Button
              isActive={nonTransitMode === WALK}
              isDisabled={disabled}
              onClick={_selectAccessMode(WALK)}
              title={message('analysis.modes.walk')}
            >
              <ModeIcon mode='WALK' />
            </Button>
            <Button
              isActive={nonTransitMode === BICYCLE}
              isDisabled={disabled}
              onClick={_selectAccessMode(BICYCLE)}
              title={message('analysis.modes.bicycle')}
            >
              <ModeIcon mode={BICYCLE} />
            </Button>
            <Button
              isActive={nonTransitMode === CAR}
              isDisabled={disabled}
              onClick={_selectAccessMode(CAR)}
              title={message('analysis.modes.car')}
            >
              <ModeIcon mode={CAR} />
            </Button>
            <Button
              isActive={nonTransitMode === CAR_PARK}
              isDisabled={disabled || !transit}
              onClick={_selectAccessMode(CAR_PARK)}
              title={message('analysis.modes.carPark')}
            >
              <ModeIcon mode={CAR_PARK} />
            </Button>
          </ButtonGroup>
        </Box>
      </FormControl>
      <FormControl>
        <FormLabel htmlFor='transitModes'>Transit modes</FormLabel>
        <Box>
          <ButtonGroup isAttached id='transitModes'>
            <Button
              isActive={_hasAllTransit()}
              isDisabled={disabled}
              onClick={_toggleTransitMode(ALL)}
              title='All'
            >
              All
            </Button>
            <Button
              isActive={_hasTransit(BUS)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(BUS)}
              title={message('mode.bus')}
            >
              <Icon icon={faBus} />
            </Button>
            <Button
              isActive={_hasTransit(TRAM)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(TRAM)}
              title={message('mode.tram')}
            >
              <strong>T</strong>
            </Button>
            <Button
              isActive={_hasTransit(SUBWAY)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(SUBWAY)}
              title={message('mode.subway')}
            >
              <Icon icon={faSubway} />
            </Button>
            <Button
              isActive={_hasTransit(RAIL)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(RAIL)}
              title={message('mode.rail')}
            >
              <Icon icon={faTrain} />
            </Button>
            <Button
              isActive={_hasTransit(FERRY)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(FERRY)}
              title={message('mode.ferry')}
            >
              <Icon icon={faShip} />
            </Button>
            <Button
              isActive={_hasTransit(CABLE_CAR)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(CABLE_CAR)}
              title={message('mode.cableCar')}
            >
              <strong>C</strong>
            </Button>
            <Button
              isActive={_hasTransit(GONDOLA)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(GONDOLA)}
              title={message('mode.gondola')}
            >
              <strong>G</strong>
            </Button>
            <Button
              isActive={_hasTransit(FUNICULAR)}
              isDisabled={disabled}
              onClick={_toggleTransitMode(FUNICULAR)}
              title={message('mode.funicular')}
            >
              <strong>F</strong>
            </Button>
          </ButtonGroup>
        </Box>
      </FormControl>
      <FormControl>
        <FormLabel pr={0} htmlFor='egressMode'>
          Egress mode
        </FormLabel>
        <Box>
          <ButtonGroup isAttached id='egressMode'>
            <Button
              isActive={transit && egressModes === WALK}
              isDisabled={!transit || disabled}
              onClick={() => selectEgressMode(WALK)}
              title={message('analysis.modes.walk')}
            >
              <Icon icon={faWalking} />
            </Button>
            <Button
              isActive={transit && egressModes === BICYCLE}
              isDisabled={!transit || disabled}
              onClick={() => selectEgressMode(BICYCLE)}
              title={message('analysis.modes.bicycle')}
            >
              <Icon icon={faBicycle} />
            </Button>
          </ButtonGroup>
        </Box>
      </FormControl>
    </Flex>
  )
}
