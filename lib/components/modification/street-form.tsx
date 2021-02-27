import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Stack,
  Switch
} from '@chakra-ui/react'
import {useCallback, useMemo} from 'react'

import {BICYCLE, CAR, WALK} from 'lib/constants'
import useInput from 'lib/hooks/use-controlled-input'

// Is input value a valid float?
const isValidFloat = (float) => !isNaN(float) && float > 0

export default function StreetForm({modification, update, ...p}) {
  const {allowedModes} = modification

  const updateMode = useCallback(
    (mode: string) => (on: boolean) => {
      const modes = new Set(allowedModes)
      if (on) modes.add(mode)
      else modes.delete(mode)
      update({allowedModes: Array.from(modes)})
    },
    [allowedModes, update]
  )

  const bikeSwitch = useInput({
    onChange: useMemo(() => updateMode(BICYCLE), [updateMode]),
    value: modification.allowedModes.includes(BICYCLE)
  })
  const bikeTimeFactor = useInput({
    onChange: useCallback((bikeTimeFactor) => update({bikeTimeFactor}), [
      update
    ]),
    parse: parseFloat,
    test: isValidFloat,
    value: modification.bikeTimeFactor
  })
  const bikeLts = useInput({
    onChange: useCallback((bikeLts) => update({bikeLts}), [update]),
    parse: parseInt,
    value: modification.bikeLts
  })

  const carSwitch = useInput({
    onChange: useMemo(() => updateMode(CAR), [updateMode]),
    value: modification.allowedModes.includes(CAR)
  })
  const carSpeed = useInput({
    onChange: useCallback((carSpeedKph) => update({carSpeedKph}), [update]),
    parse: parseFloat,
    test: isValidFloat,
    value: modification.carSpeedKph
  })

  const walkSwitch = useInput({
    onChange: useMemo(() => updateMode(WALK), [updateMode]),
    value: modification.allowedModes.includes(WALK)
  })
  const walkTimeFactor = useInput({
    onChange: useCallback((walkTimeFactor) => update({walkTimeFactor}), [
      update
    ]),
    parse: parseFloat,
    test: isValidFloat,
    value: modification.walkTimeFactor
  })

  return (
    <Stack {...p} spacing={6}>
      <Alert status='warning'>
        <AlertIcon />
        EXPERIMENTAL: ongoing compatibility not guaranteed, routing engine
        v5.9.0 or higher required.
      </Alert>
      <Box>
        <Flex justify='space-between'>
          <FormLabel htmlFor={bikeSwitch.id} fontSize='lg'>
            Enable biking
          </FormLabel>
          <Switch
            id={bikeSwitch.id}
            isChecked={bikeSwitch.value}
            onChange={bikeSwitch.onChange}
          />
        </Flex>
        {bikeSwitch.value && (
          <Stack spacing={4}>
            <FormControl isInvalid={!bikeTimeFactor.isValid}>
              <FormLabel htmlFor={bikeTimeFactor.id}>
                Bike Time Factor
              </FormLabel>
              <Input {...bikeTimeFactor} />
              <FormHelperText>Must be greater than 0</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor={bikeLts.id}>
                Bike Level of Traffic Stress
              </FormLabel>
              <Select
                id={bikeLts.id}
                onChange={bikeLts.onChange}
                value={bikeLts.value}
              >
                <option value={1}>1 - Low stress</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4 - High stress</option>
              </Select>
            </FormControl>
          </Stack>
        )}
      </Box>

      <Box>
        <Flex justify='space-between'>
          <FormLabel htmlFor={carSwitch.id} fontSize='lg'>
            Enable driving
          </FormLabel>
          <Switch
            id={carSwitch.id}
            isChecked={carSwitch.value}
            onChange={carSwitch.onChange}
          />
        </Flex>
        {carSwitch.value && (
          <FormControl isInvalid={carSpeed.isInvalid}>
            <FormLabel htmlFor={carSpeed.id}>Car Speed</FormLabel>
            <Input {...carSpeed} />
          </FormControl>
        )}
      </Box>

      <Box>
        <Flex justify='space-between'>
          <FormLabel htmlFor={walkSwitch.id} fontSize='lg'>
            Enable walking
          </FormLabel>
          <Switch
            id={walkSwitch.id}
            isChecked={walkSwitch.value}
            onChange={walkSwitch.onChange}
          />
        </Flex>
        {walkSwitch.value && (
          <FormControl isInvalid={walkTimeFactor.isInvalid}>
            <FormLabel htmlFor={walkTimeFactor.id}>Walk Time Factor</FormLabel>
            <Input {...walkTimeFactor} />
            <FormHelperText>Must be greater than 0</FormHelperText>
          </FormControl>
        )}
      </Box>
    </Stack>
  )
}
