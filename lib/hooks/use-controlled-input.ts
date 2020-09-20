import get from 'lodash/get'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {v4 as uuid} from 'uuid'

const alwaysValid = (p = '', r = '') => true // eslint-disable-line
const identityFn = (v) => v

// Is this the value itself or an event?
function getRawValueFromInput(input) {
  const isEvent =
    get(input, 'target.value') != null ||
    input instanceof Event ||
    get(input, 'nativeEvent') instanceof Event

  if (isEvent) {
    const target = input.target
    if (target.type === 'checkbox') return target.checked
    return target.value
  } else {
    return input
  }
}

/**
 * Helper hook for allowing controlled inputs that can frequently update but not slow down the interface.
 */
export default function useControlledInput({
  onChange = identityFn,
  id = null,
  parse = identityFn,
  test = alwaysValid,
  value
}) {
  const [inputValue, setInputValue] = useState(value)
  const [isValid, setIsValid] = useState(() =>
    test(parse(inputValue), inputValue)
  )
  const ref = useRef<any>()

  // Generate ids when they do not exist
  const autoId = useMemo(() => id || uuid(), [id])

  // Update the value from the external source on change unless the input is
  // currently the active element.
  useEffect(() => {
    if (ref.current !== document.activeElement) {
      setInputValue(value)
      setIsValid(test(parse(value), value))
    }
  }, [parse, ref, setInputValue, test, value])

  // Get the value from the Input, parse it, test it, and then pass then parsed
  // value to the original onChange function. This keeps the input in sync.
  const inputOnChange = useCallback(
    async (input) => {
      const rawValue = getRawValueFromInput(input)
      // Ensure the displayed value syncs fast, even if it's not valid
      setInputValue(rawValue)
      const parsedValue = parse(rawValue)
      const isValid = test(parsedValue, rawValue)
      setIsValid(isValid)
      // Don't pass invalid changes through to the onChange function
      if (!isValid) return
      // Allow the sync to occur before propogating the change
      await onChange(parsedValue)
    },
    [onChange, parse, setInputValue, setIsValid, test]
  )

  return {
    onChange: inputOnChange,
    id: autoId,
    isInvalid: !isValid,
    isValid,
    ref,
    value: inputValue
  }
}
