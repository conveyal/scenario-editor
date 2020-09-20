import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/core'

import useControlledInput from 'lib/hooks/use-controlled-input'

const defaultTest = (parsed) => parsed >= 1
const defaultParse = (targetValue) => parseFloat(targetValue)

const noop = () => {}

export default function NumberInput({
  isDisabled = false,
  label = '',
  onBlur = noop,
  onChange,
  onFocus = noop,
  parse = defaultParse,
  placeholder = '',
  test = defaultTest,
  units = '',
  value,
  ...p
}) {
  const input = useControlledInput({
    onChange,
    parse,
    test,
    value
  })

  return (
    <FormControl isDisabled={isDisabled} isInvalid={input.isInvalid} {...p}>
      {label && <FormLabel htmlFor={input.id}>{label}</FormLabel>}
      <InputGroup>
        <Input
          {...input}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          type='text'
        />
        {units && (
          <InputRightElement
            color='gray.400'
            userSelect='none'
            mr={4}
            width='unset'
          >
            {units}
          </InputRightElement>
        )}
      </InputGroup>
    </FormControl>
  )
}
