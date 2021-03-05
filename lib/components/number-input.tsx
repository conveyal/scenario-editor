import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react'
import {FocusEvent} from 'react'

import useControlledInput from 'lib/hooks/use-controlled-input'

const defaultTest = (parsed: number) => parsed >= 1
const defaultParse = (targetValue: string) => parseFloat(targetValue)

const noop = () => {}

type NumberInputProps = {
  label?: string
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onChange: (newValue: number) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  parse?: (targetValue: string) => number
  placeholder?: string
  test?: (parsed: number) => boolean
  units?: string
  value: number
}

export default function NumberInput({
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
}: NumberInputProps) {
  const input = useControlledInput({
    onChange,
    parse,
    test,
    value
  })

  return (
    <FormControl isInvalid={input.isInvalid} {...p}>
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
