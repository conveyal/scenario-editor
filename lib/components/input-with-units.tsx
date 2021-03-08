import {
  Input,
  InputGroup,
  InputRightElement,
  InputProps,
  forwardRef
} from '@chakra-ui/react'

const InputWithUnits = forwardRef<InputProps & {units: string}, typeof Input>(
  (props, ref) => {
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
  }
)

export default InputWithUnits
