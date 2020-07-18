import {Box, Flex, Input, PseudoBox, useDisclosure} from '@chakra-ui/core'
import {faCheck, faPencilAlt} from '@fortawesome/free-solid-svg-icons'
import {useEffect, useCallback} from 'react'

import useInput from 'lib/hooks/use-controlled-input'

import IconButton from './icon-button'

const defaultEditLabel = 'Click to edit'

const alwaysValid = (s) => true

export default function Editable({
  isValid = alwaysValid,
  onChange,
  placeholder = 'Add value',
  value
}) {
  const {isOpen, onClose, onOpen} = useDisclosure()

  if (isOpen) {
    return (
      <HiddenInput
        isValid={isValid}
        onChange={onChange}
        onClose={onClose}
        placeholder={placeholder}
        value={value}
      />
    )
  } else {
    return (
      <PseudoBox
        alignItems='center'
        cursor='pointer'
        display='flex'
        role='group'
        onClick={onOpen}
      >
        {value ? (
          <Box flex='1'>{value}</Box>
        ) : (
          <Box flex='1' color='gray.500'>
            {placeholder}
          </Box>
        )}
        <PseudoBox visibility='hidden' _groupHover={{visibility: 'unset'}}>
          <IconButton
            icon={faPencilAlt}
            label={defaultEditLabel}
            onClick={onOpen}
          />
        </PseudoBox>
      </PseudoBox>
    )
  }
}

function HiddenInput({isValid, onChange, onClose, placeholder, value}) {
  const input = useInput({
    test: isValid,
    value
  })
  const inputRef = input.ref

  const save = useCallback(() => {
    onChange(inputRef.current.value)
    onClose()
  }, [onChange, onClose, inputRef])

  // Handle ESC / Enter
  useEffect(() => {
    const listener = ({key}) => {
      if (key === 'Escape') {
        onClose()
      } else if (key === 'Enter') {
        save()
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [save]) // Run once on mount / unmount

  // Select all the text by default
  useEffect(() => {
    const inputElement = inputRef.current
    if (inputElement) {
      inputElement.select()
    }
  }, [inputRef])

  return (
    <Flex align='center'>
      <Input
        {...input}
        height='unset'
        onBlur={save}
        outline='none'
        p={0}
        placeholder={placeholder}
        variant='flushed'
      />
      {input.isValid && (
        <IconButton icon={faCheck} label='Save' onClick={save} />
      )}
    </Flex>
  )
}
