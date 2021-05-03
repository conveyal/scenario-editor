import {
  Input,
  InputGroup,
  InputRightElement,
  InputProps,
  forwardRef
} from '@chakra-ui/react'

import {inputPaddingX} from 'lib/config/chakra'

const InputWithUnits = forwardRef<InputProps & {units?: string}, typeof Input>(
  (props, ref) => {
    const {units, ...p} = props
    return (
      <InputGroup>
        <Input {...p} ref={ref} />
        {units && (
          <InputRightElement
            color='gray.400'
            userSelect='none'
            width='unset'
            mr={inputPaddingX}
          >
            {units}
          </InputRightElement>
        )}
      </InputGroup>
    )
  }
)

export default InputWithUnits
