import {FormControl, FormLabel, FormControlProps} from '@chakra-ui/react'
import {memo} from 'react'

import useControlledInput from 'lib/hooks/use-controlled-input'
import {secondsToHhMmSsString} from 'lib/utils/time'

import InputWithUnits from './input-with-units'

const FORMAT = 'HH:mm:ss'

const arrayToSeconds = ([h, m, s]) => s + m * 60 + h * 60 * 60
const isValidFormat = (s) => /^\d\d:\d\d:\d\d$/.test(s)
const stringToSeconds = (s) =>
  isValidFormat(s)
    ? arrayToSeconds(s.match(/\d+/g).map((s) => parseInt(s)))
    : NaN

const test = (parsed, rawValue) => parsed >= 0 && isValidFormat(rawValue)

const noop = () => {}

interface Props {
  disabled?: boolean
  label: string
  onBlur?: (SyntheticEvent) => void
  onChange: (number) => void
  onFocus?: (SyntheticEvent) => void
  placeholder?: string
  seconds: number
}

export default memo<Props & FormControlProps>(function MinutesSeconds({
  disabled = false,
  label,
  onBlur = noop,
  onChange,
  onFocus = noop,
  placeholder = '',
  seconds,
  ...p
}) {
  const input = useControlledInput({
    onChange,
    parse: stringToSeconds,
    test,
    value:
      seconds != null ? secondsToHhMmSsString(Math.round(seconds)) : undefined
  })
  return (
    <FormControl isDisabled={disabled} isInvalid={input.isInvalid} {...p}>
      <FormLabel htmlFor={input.id}>{label}</FormLabel>
      <InputWithUnits
        {...input}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        type='text'
        units={FORMAT}
      />
    </FormControl>
  )
})
