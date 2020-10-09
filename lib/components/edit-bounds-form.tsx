import {
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text
} from '@chakra-ui/core'
import startCase from 'lodash/startCase'
import dynamic from 'next/dynamic'
import {useCallback} from 'react'

import {SPACING_FORM} from 'lib/constants/chakra'
import useControlledInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'
import {directions, boundIsValid} from 'lib/utils/bounds'

import DocsLink from './docs-link'
import Tip from './tip'

const EditBounds = dynamic(() => import('lib/components/map/edit-bounds'), {
  ssr: false
})

export default function EditBoundsForm({bounds, isDisabled, setBounds, ...p}) {
  return (
    <Stack spacing={SPACING_FORM} {...p}>
      <EditBounds bounds={bounds} save={setBounds} />

      <Heading size='sm'>
        {message('region.bounds')}{' '}
        <DocsLink to='/analysis/methodology/#spatial-resolution' />
      </Heading>
      <Text>{message('region.boundsNotice')}</Text>
      <SimpleGrid columns={2} spacing={SPACING_FORM}>
        {Object.keys(directions).map((d) => (
          <DirectionInput
            bounds={bounds}
            direction={d}
            isDisabled={isDisabled}
            key={d}
            setBounds={setBounds}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}

function DirectionInput({bounds, direction, isDisabled, setBounds, ...p}) {
  const onChange = useCallback(
    (newVal) => setBounds((b) => ({...b, [direction]: newVal})),
    [direction, setBounds]
  )
  const test = useCallback((v) => boundIsValid(direction, v, bounds), [
    bounds,
    direction
  ])
  const input = useControlledInput({
    onChange,
    parse: parseFloat,
    test,
    value: bounds[direction]
  })
  const helperText = `${startCase(direction)} must be between ${
    directions[direction].min
  } and ${directions[direction].max} degrees.`
  return (
    <FormControl
      isDisabled={isDisabled}
      isInvalid={input.isInvalid}
      isRequired
      {...p}
    >
      <FormLabel htmlFor={input.id}>{startCase(direction)}</FormLabel>
      <Tip isDisabled={isDisabled} label={helperText}>
        <Input {...input} userSelect='all' />
      </Tip>
    </FormControl>
  )
}
