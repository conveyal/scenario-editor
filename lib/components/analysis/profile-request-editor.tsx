import {
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  SimpleGrid,
  Flex,
  InputProps
} from '@chakra-ui/core'
import get from 'lodash/get'
import toStartCase from 'lodash/startCase'
import {forwardRef, useCallback} from 'react'

import useInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'
import {workerVersionTestOrInRange} from 'lib/modules/r5-version/utils'

import DocsLink from '../docs-link'
import TimePicker from '../time-picker'
import Tip from '../tip'

const TenPM = 22 * 60 * 60
const bold = (b) => `<strong>${b}</strong>`
const defaultDecayFunction = {type: 'step'}

function bundleIsOutOfDate(bundle, dateString, project) {
  if (project === null || project === undefined) return
  const date = new Date(dateString)
  const {serviceEnd, serviceStart} = bundle
  if (
    bundle != null &&
    (new Date(serviceStart) > date || new Date(serviceEnd) < date)
  ) {
    return message('analysis.bundleOutOfDate', {
      bundle: bold(bundle.name),
      project: bold(project.name),
      serviceStart: bold(serviceStart),
      serviceEnd: bold(serviceEnd),
      selectedDate: bold(dateString)
    })
  }
}

const InputWithUnits: React.ComponentType<
  {units: string} & InputProps
> = forwardRef((props, ref) => {
  const {units, ...p} = props
  return (
    <InputGroup>
      <Input {...p} ref={ref} />
      <InputRightElement
        color='gray.400'
        userSelect='none'
        width='unset'
        mr={4}
      >
        {units}
      </InputRightElement>
    </InputGroup>
  )
})

// Helper function for testing inputs
const valueWithin = (min: number, max: number) => (v) => {
  return v >= min && v <= max
}

// Helper for max mode times which can be null
const modeLessThanMax = (max: number) => (v) => {
  return isNaN(v) ? true : v <= max
}

// Create the functions here so they are not generated on each render
const testWalkSpeed = valueWithin(3, 15)
const testWalkTime = modeLessThanMax(60)
const testBikeSpeed = valueWithin(5, 20)
const testBikeTime = modeLessThanMax(60)
const testMaxTransfers = valueWithin(0, 7)
const testMonteCarlo = valueWithin(1, 1200)
const testStandardDeviationMinutes = valueWithin(1, 60)
const testWidthMinutes = valueWithin(1, 60)

// Check modes for the type given
const containsType = (pr, type) =>
  pr.accessModes.indexOf(type) > -1 ||
  pr.directModes.indexOf(type) > -1 ||
  (pr.egressModes.indexOf(type) > -1 && pr.transitModes.length > 0)

// Conditionally set display to 'none' if false
const displayIf = (b: boolean) => (b ? 'inherit' : 'none')

/**
 * Edit the parameters of a profile request.
 */
export default function ProfileRequestEditor({
  bundle,
  disabled,
  profileRequest,
  project,
  updateProfileRequest,
  ...p
}) {
  // Keep times in order when setting.
  const setFromTime = useCallback(
    (timeString) => {
      const fromTime = parseInt(timeString)
      if (fromTime >= profileRequest.toTime) {
        updateProfileRequest({fromTime, toTime: fromTime + 60 * 60})
      } else {
        updateProfileRequest({fromTime})
      }
    },
    [profileRequest, updateProfileRequest]
  )
  const setToTime = useCallback(
    (timeString) => {
      const toTime = parseInt(timeString)
      if (profileRequest.fromTime >= toTime) {
        updateProfileRequest({fromTime: toTime - 60 * 60, toTime})
      } else {
        updateProfileRequest({toTime})
      }
    },
    [profileRequest, updateProfileRequest]
  )

  const {fromTime, toTime} = profileRequest
  const bundleOutOfDate = bundleIsOutOfDate(
    bundle,
    profileRequest.date,
    project
  )

  const setDate = useCallback((date) => updateProfileRequest({date}), [
    updateProfileRequest
  ])
  const dateInput = useInput({
    onChange: setDate,
    value: profileRequest.date
  })

  const setWalkSpeed = useCallback(
    (walkSpeed) => updateProfileRequest({walkSpeed: walkSpeed / 3.6}), // km/h to m/s
    [updateProfileRequest]
  )
  const walkSpeedInput = useInput({
    onChange: setWalkSpeed,
    parse: parseFloat,
    test: testWalkSpeed,
    value: Math.round(profileRequest.walkSpeed * 36) / 10 // m/s to km/h
  })

  const setWalkTime = useCallback(
    (maxWalkTime) => updateProfileRequest({maxWalkTime}),
    [updateProfileRequest]
  )
  const maxWalkTimeInput = useInput({
    onChange: setWalkTime,
    parse: parseInt,
    test: testWalkTime,
    value: profileRequest.maxWalkTime
  })

  const setBikeSpeed = useCallback(
    (bikeSpeed) => updateProfileRequest({bikeSpeed: bikeSpeed / 3.6}), // km/h to m/s
    [updateProfileRequest]
  )
  const bikeSpeedInput = useInput({
    onChange: setBikeSpeed,
    parse: parseFloat,
    test: testBikeSpeed,
    value: Math.round(profileRequest.bikeSpeed * 36) / 10
  })

  const setMaxBikeTime = useCallback(
    (maxBikeTime) => updateProfileRequest({maxBikeTime}),
    [updateProfileRequest]
  )
  const maxBikeTimeInput = useInput({
    onChange: setMaxBikeTime,
    parse: parseInt,
    test: testBikeTime,
    value: profileRequest.maxBikeTime
  })

  const setMaxRides = useCallback(
    (maxTransfers) => updateProfileRequest({maxRides: maxTransfers + 1}),
    [updateProfileRequest]
  )
  const maxTransfersInput = useInput({
    onChange: setMaxRides,
    parse: parseInt,
    test: testMaxTransfers,
    value: profileRequest.maxRides - 1 // Max rides is max transfers + 1, but transfers is common usage terminology
  })

  const setMonteCarlo = useCallback(
    (monteCarloDraws) => updateProfileRequest({monteCarloDraws}),
    [updateProfileRequest]
  )
  const monteCarloInput = useInput({
    onChange: setMonteCarlo,
    parse: parseInt,
    test: testMonteCarlo,
    value: profileRequest.monteCarloDraws
  })

  const hasBike =
    containsType(profileRequest, 'BICYCLE') ||
    containsType(profileRequest, 'BICYCLE_RENT')
  const hasTransit = profileRequest.transitModes.length > 0
  const hasWalk = containsType(profileRequest, 'WALK')

  return (
    <SimpleGrid columns={4} spacing={5} {...p}>
      <FormControl
        display={displayIf(hasTransit)}
        isDisabled={disabled}
        isInvalid={bundleOutOfDate || dateInput.isInvalid}
      >
        <FormLabel htmlFor={dateInput.id}>{message('analysis.date')}</FormLabel>
        <Input
          {...dateInput}
          isInvalid={!!bundleOutOfDate || dateInput.isInvalid}
          type='date'
        />
      </FormControl>

      <TimePicker
        disabled={disabled}
        display={displayIf(hasTransit)}
        label={message('analysis.fromTime')}
        value={fromTime}
        onChange={setFromTime}
      />

      <TimePicker
        disabled={disabled}
        display={displayIf(hasTransit)}
        label={message('analysis.toTime')}
        value={toTime}
        onChange={setToTime}
      />

      <FormControl
        display={displayIf(hasTransit)}
        isDisabled={disabled}
        isInvalid={maxTransfersInput.isInvalid}
      >
        <FormLabel htmlFor={maxTransfersInput.id}>
          {message('analysis.transfers')}
        </FormLabel>
        <Input {...maxTransfersInput} type='number' maxLength={1} />
      </FormControl>

      {hasTransit && toTime >= TenPM && (
        <Alert status='error' gridColumn='1 / span 4'>
          <AlertIcon /> Trips over midnight may not work correctly.
        </Alert>
      )}

      {hasTransit && bundleOutOfDate && (
        <Alert status='error' gridColumn='1 / span 4'>
          <AlertIcon />
          <span dangerouslySetInnerHTML={{__html: bundleOutOfDate}} />
        </Alert>
      )}

      <FormControl
        display={displayIf(hasWalk)}
        isDisabled={disabled}
        isInvalid={walkSpeedInput.isInvalid}
      >
        <FormLabel htmlFor={walkSpeedInput.id}>Walk speed</FormLabel>
        <Tip label='Range 3-15' placement='bottom'>
          <InputWithUnits {...walkSpeedInput} type='number' units='km/h' />
        </Tip>
      </FormControl>

      <FormControl
        display={displayIf(hasWalk && hasTransit)}
        isDisabled={disabled}
        isInvalid={maxWalkTimeInput.isInvalid}
      >
        <FormLabel htmlFor={maxWalkTimeInput.id}>Max walk time</FormLabel>
        <Tip
          label='Maximum of 60. Lower time limits apply to transfers and egress legs.'
          placement='bottom'
        >
          <InputWithUnits {...maxWalkTimeInput} units='minutes' />
        </Tip>
      </FormControl>

      <FormControl
        display={displayIf(hasBike)}
        isDisabled={disabled}
        isInvalid={bikeSpeedInput.isInvalid}
      >
        <FormLabel htmlFor={bikeSpeedInput.id}>Bike speed</FormLabel>
        <Tip label='Range 5-20' placement='bottom'>
          <InputWithUnits {...bikeSpeedInput} type='number' units='km/h' />
        </Tip>
      </FormControl>

      <FormControl
        display={displayIf(hasBike && hasTransit)}
        isDisabled={disabled}
        isInvalid={maxBikeTimeInput.isInvalid}
      >
        <FormLabel htmlFor={maxBikeTimeInput.id}>Max bike time</FormLabel>
        <Tip
          label='Maximum of 60. Lower time limits apply to transfer and egress legs.'
          placement='bottom'
        >
          <InputWithUnits {...maxBikeTimeInput} units='minutes' />
        </Tip>
      </FormControl>

      <FormControl display={displayIf(hasBike)} isDisabled={disabled}>
        <Flex justify='space-between'>
          <FormLabel htmlFor='bikeLts'>Max LTS</FormLabel>
          <div>
            <DocsLink to='learn-more/lts' />
          </div>
        </Flex>
        <Select
          id='bikeLts'
          onChange={(v) =>
            updateProfileRequest({bikeTrafficStress: parseInt(v.target.value)})
          }
          value={get(profileRequest, 'bikeTrafficStress', 4)}
        >
          <option value={1}>1 - Low stress</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4 - High stress</option>
        </Select>
      </FormControl>

      <DecayFunction
        isDisabled={
          disabled ||
          !workerVersionTestOrInRange(profileRequest.workerVersion, 'v6.0.0')
        }
        update={(decayFunction) => {
          updateProfileRequest({decayFunction})
        }}
        value={get(profileRequest, 'decayFunction', defaultDecayFunction)}
      />

      <FormControl
        display={displayIf(hasTransit)}
        isDisabled={disabled}
        isInvalid={monteCarloInput.isInvalid}
      >
        <FormLabel htmlFor={monteCarloInput.id}>
          {message('analysis.monteCarloDraws')}
        </FormLabel>
        <Input {...monteCarloInput} />
      </FormControl>
    </SimpleGrid>
  )
}

const decayFunctionTypes = ['step', 'logistic', 'exponential', 'linear']

function DecayFunction({isDisabled, update, value}) {
  const onChangeType = useCallback((type) => update({...value, type}), [
    update,
    value
  ])
  const typeInput = useInput({
    value: value.type,
    onChange: onChangeType
  })

  const onChangeSD = useCallback(
    (sd) => update({...value, standardDeviationMinutes: sd}),
    [update, value]
  )
  const standardDeviationInput = useInput({
    onChange: onChangeSD,
    parse: parseInt,
    test: testStandardDeviationMinutes,
    value: value.standardDeviationMinutes
  })

  const onChangeWidth = useCallback(
    (wm) => update({...value, widthMinutes: wm}),
    [update, value]
  )
  const widthMinutesInput = useInput({
    onChange: onChangeWidth,
    parse: parseInt,
    test: testWidthMinutes,
    value: value.widthMinutes
  })

  return (
    <>
      <FormControl isDisabled={isDisabled}>
        <Flex justify='space-between'>
          <FormLabel htmlFor={typeInput.id}>Decay Function</FormLabel>
          <div>
            <DocsLink to='learn-more/decay-functions' />
          </div>
        </Flex>
        <Select {...typeInput}>
          {decayFunctionTypes.map((t) => (
            <option key={t} value={t}>
              {toStartCase(t)}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl
        display={displayIf(typeInput.value === 'logistic')}
        isDisabled={isDisabled}
        isInvalid={standardDeviationInput.isInvalid}
      >
        <FormLabel htmlFor={standardDeviationInput.id}>
          Standard Deviation
        </FormLabel>
        <Tip label='Range 1-60' placement='bottom'>
          <InputWithUnits {...standardDeviationInput} units='minutes' />
        </Tip>
      </FormControl>

      <FormControl
        display={displayIf(typeInput.value === 'linear')}
        isDisabled={isDisabled}
        isInvalid={widthMinutesInput.isInvalid}
      >
        <FormLabel htmlFor={widthMinutesInput.id}>Decay Width</FormLabel>
        <Tip label='Range 1-60' placement='bottom'>
          <InputWithUnits {...widthMinutesInput} units='minutes' />
        </Tip>
      </FormControl>
    </>
  )
}
