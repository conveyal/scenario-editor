import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  FormControlProps
} from '@chakra-ui/react'
import {memo} from 'react'

import useInput from 'lib/hooks/use-controlled-input'
import {secondsToHhMmString} from 'lib/utils/time'

const FORMAT = 'HH:mm'

const arrayToSeconds = ([h, m]) => m * 60 + h * 60 * 60
const isValidFormat = (s) => /^\d\d:\d\d$/.test(s)
const stringToSeconds = (s) =>
  isValidFormat(s)
    ? arrayToSeconds(s.match(/\d+/g).map((s) => parseInt(s)))
    : NaN

const test = (seconds, rawString) =>
  !isNaN(seconds) && seconds >= 0 && isValidFormat(rawString)

type Props = {
  disabled?: boolean
  label: string
  onChange: (number) => void
  value: number
}

/**
 * Choose hours of day, using seconds since midnight
 */
export default memo<Props & FormControlProps>(function TimePicker({
  disabled = false,
  label,
  onChange,
  value,
  ...p
}) {
  const input = useInput({
    onChange,
    parse: stringToSeconds,
    test,
    value: secondsToHhMmString(value)
  })

  return (
    <FormControl isDisabled={disabled} isInvalid={input.isInvalid} {...p}>
      <FormLabel htmlFor={input.id}>{label}</FormLabel>
      <InputGroup>
        <Input type='text' {...input} />
        <InputRightElement color='gray.400' userSelect='none' mr={5}>
          {FORMAT}
        </InputRightElement>
      </InputGroup>
    </FormControl>
  )
})
