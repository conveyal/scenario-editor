import {FormControl, FormControlProps, FormLabel} from '@chakra-ui/react'
import {memo} from 'react'

import useControlledInput from 'lib/hooks/use-controlled-input'

import Select from './select'

const defaultGetOptionLabel = (o: any) => o.label
const defaultGetOptionValue = (o: any) => o.value

interface ControlledSelectProps {
  getOptionLabel?: (o: any) => string
  getOptionValue?: (o: any) => string
  id?: string
  isClearable?: boolean
  label: string
  onChange: (o: any) => void
  options: any[]
  value: any
}

export default memo<ControlledSelectProps & FormControlProps>(
  function ControlledSelect({
    getOptionLabel = defaultGetOptionLabel,
    getOptionValue = defaultGetOptionValue,
    id = null,
    isClearable = false,
    isDisabled = false,
    label,
    options,
    onChange,
    value,
    ...p
  }) {
    const input = useControlledInput({id, onChange, value})
    return (
      <FormControl isDisabled={isDisabled} isInvalid={input.isInvalid} {...p}>
        <FormLabel htmlFor={input.id}>{label}</FormLabel>
        <Select
          inputId={input.id}
          isClearable={isClearable}
          isDisabled={isDisabled}
          isLoading={input.value !== value}
          getOptionLabel={getOptionLabel}
          getOptionValue={getOptionValue}
          onChange={input.onChange}
          options={options}
          value={input.value}
        />
      </FormControl>
    )
  }
)
