import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react'

import useControlledInput from 'lib/hooks/use-controlled-input'

const test = (parsed) => parsed >= 1
const parse = (targetValue) => parseFloat(targetValue)

const noop = () => {}

export default function Speed({
  isDisabled = false,
  label,
  onBlur = noop,
  onChange,
  onFocus = noop,
  placeholder = '',
  speed,
  ...p
}) {
  const input = useControlledInput({
    onChange,
    parse,
    test,
    value: speed
  })

  return (
    <FormControl isDisabled={isDisabled} isInvalid={input.isInvalid} {...p}>
      <FormLabel htmlFor={input.id}>{label}</FormLabel>
      <InputGroup>
        <Input
          {...input}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          type='text'
        />
        <InputRightElement
          color='gray.400'
          userSelect='none'
          mr={4}
          width='unset'
        >
          km/h
        </InputRightElement>
      </InputGroup>
    </FormControl>
  )
}
