import get from 'lodash/get'
import {useCallback, useEffect, useRef, useState} from 'react'

const noop = () => true

export default function useControlledInput(
  propValue,
  propOnChange,
  testValid = noop
) {
  const [inputValue, setInputValue] = useState(propValue)
  const ref = useRef()

  // Update the value from the external source on change unless the input is
  // currently the active element.
  useEffect(() => {
    if (ref.current !== document.activeElement) setInputValue(propValue)
  }, [propValue, ref, setInputValue])

  const onChange = useCallback(
    input => {
      // Is this the value itself or an event?
      const isEvent =
        input instanceof Event || get(input, 'nativeEvent') instanceof Event
      const value = isEvent ? input.target.value : input
      const isValid = testValid(value)
      // Ensure the displayed value syncs fast, even if it's not valid
      setInputValue(value)
      // Don't pass invalid changes through to the onChange function
      if (!isValid) return
      // Allow the sync to occur before propogating the change
      setImmediate(() => propOnChange(value))
    },
    [propOnChange, setInputValue, testValid]
  )

  return [inputValue, onChange, ref, testValid(inputValue)]
}
