import {
  Box,
  Flex,
  FlexProps,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import {RefObject, useCallback, useEffect, useRef, useState} from 'react'

import {ChevronDown} from 'lib/components/icons'
import Tip from 'lib/components/tip'

const noop = () => {}

interface OptionType {
  name: string
  _id: string
}

interface OptionComponentProps<T extends OptionType> {
  isSelected: boolean
  onClick: (option: T) => void
  option: T
}

interface ComboboxProps<T extends OptionType> {
  isDisabled?: boolean
  isEqual?: (a: T, b: T) => boolean
  isLoading?: boolean
  onChange: (newValue: T) => Promise<void> | void
  options: T[]
  placeholder?: string
  renderOption?: (props: OptionComponentProps<T>) => React.ReactNode
  value?: T
  variant?: 'ghost' | 'normal'
  width?: string
}

interface ComboboxSearchProps<T extends OptionType> extends ComboboxProps<T> {
  inputRef: RefObject<HTMLInputElement>
}

function DefaultOption<T extends OptionType>({
  isSelected,
  onClick,
  option
}: OptionComponentProps<T>) {
  const focusBg = useColorModeValue('blue.50', 'blue.900')
  return (
    <Box
      bg={isSelected ? 'blue.500' : 'inherit'}
      color={isSelected ? 'blue.500' : 'inherit'}
      fontSize='lg'
      cursor='pointer'
      key={option._id}
      onClick={() => onClick(option)}
      px={3}
      py={2}
      rounded={0}
      tabIndex={0}
      _hover={{
        bg: 'blue.500',
        color: 'white'
      }}
      _focus={{
        bg: focusBg
      }}
    >
      <Text
        overflowX='hidden'
        textAlign='left'
        textOverflow='ellipsis'
        whiteSpace='nowrap'
      >
        {option.name}
      </Text>
    </Box>
  )
}

function ComboboxSearch<T extends OptionType>({
  inputRef,
  onChange,
  options,
  placeholder,
  renderOption,
  value
}: ComboboxSearchProps<T>) {
  const [filter, setFilter] = useState('')
  const [displayedOptions, setDisplayedOptions] = useState<T[]>(options)

  useEffect(() => {
    if (filter?.length > 0) {
      setDisplayedOptions(options.filter((o) => o.name.indexOf(filter) > -1))
    } else {
      setDisplayedOptions(options)
    }
  }, [filter, options])

  return (
    <Stack spacing={0}>
      <Input
        onChange={(e) => setFilter(e.currentTarget.value)}
        pl={3}
        placeholder={placeholder}
        ref={inputRef}
        size='lg'
        variant='flushed'
        value={filter}
      />
      <Stack spacing={0} maxHeight={200} overflowY='scroll'>
        {displayedOptions.map((option) =>
          renderOption({
            onClick: onChange,
            option,
            isSelected: option === value
          })
        )}
      </Stack>
    </Stack>
  )
}

function Trigger({
  isDisabled,
  isLoading,
  label,
  onClick,
  width,
  ...p
}: {
  isDisabled?: boolean
  isLoading?: boolean
  label: string
  onClick: () => void
  width: string
} & FlexProps) {
  return (
    <Flex
      align='center'
      borderWidth='1px'
      cursor='pointer'
      onClick={isDisabled ? noop : onClick}
      onFocus={isDisabled ? noop : onClick}
      py={2}
      px={3}
      justify='space-between'
      role='group'
      tabIndex={0}
      rounded='md'
      width={width}
      {...p}
    >
      <Box pr={3}>{label}</Box>
      <Box borderLeftWidth='1px' opacity={0.3} pl={3}>
        {isLoading ? (
          <Box pt={1}>
            <Spinner size='xs' />
          </Box>
        ) : (
          <ChevronDown />
        )}
      </Box>
    </Flex>
  )
}

const defaultIsEqual = (a: any, b: any) => a === b
const minWidth = 300

export default function Combobox<T extends OptionType>({
  isDisabled = false,
  isEqual = defaultIsEqual,
  isLoading = false,
  onChange,
  options,
  placeholder = 'Search',
  renderOption = (p) => <DefaultOption {...p} />,
  value,
  width = '100%'
}: ComboboxProps<T>) {
  const inputRef = useRef<HTMLInputElement>()
  const [selectedValue, setSelectedValue] = useState(() =>
    options.find((o) => isEqual(o, value))
  )
  const {isOpen, onClose, onOpen} = useDisclosure()
  const [popoverWidth, setPopoverWidth] = useState(minWidth)

  useEffect(() => {
    if (value != null) setSelectedValue(options.find((o) => isEqual(o, value)))
  }, [isEqual, options, value])

  const finalOnChange = useCallback(
    (newValue: T) => {
      onClose()
      setSelectedValue(newValue)
      requestAnimationFrame(async () => {
        await onChange(newValue)
      })
    },
    [onChange, onClose, setSelectedValue]
  )

  if (!isOpen) {
    if (selectedValue != null) {
      return (
        <Tip isDisabled={isDisabled} label={placeholder} placement='right'>
          <div style={{width}}>
            <Trigger
              isDisabled={isDisabled}
              isLoading={isLoading}
              label={selectedValue.name}
              onClick={onOpen}
              width={width}
            />
          </div>
        </Tip>
      )
    } else {
      return (
        <Trigger
          isDisabled={isDisabled}
          isLoading={isLoading}
          label={placeholder}
          onClick={onOpen}
          width={width}
        />
      )
    }
  }

  return (
    <Popover
      initialFocusRef={inputRef}
      isOpen={true}
      onClose={onClose}
      placement='bottom-start'
      isLazy
    >
      <PopoverTrigger>
        <div
          ref={(ref) => {
            const width = ref?.getBoundingClientRect()?.width
            if (width > minWidth) setPopoverWidth(width)
          }}
        >
          <Trigger
            isDisabled={false}
            isLoading={isLoading}
            label={selectedValue ? selectedValue.name : placeholder}
            onClick={noop}
            shadow='outline'
            width={width}
          />
        </div>
      </PopoverTrigger>
      <Portal>
        <PopoverContent mb={3} shadow='lg' width={popoverWidth}>
          <PopoverBody p={0}>
            <ComboboxSearch<T>
              inputRef={inputRef}
              placeholder={placeholder}
              onChange={finalOnChange}
              options={options}
              renderOption={renderOption}
              value={selectedValue}
            />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
