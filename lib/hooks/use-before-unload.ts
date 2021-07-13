import {useEffect} from 'react'

/**
 * Trigger the passed function when the page unloads.
 */
export default function useBeforeUnload(
  fn: (evt: BeforeUnloadEvent) => false | string
) {
  useEffect(() => {
    function handleBeforeunload(evt: BeforeUnloadEvent) {
      const returnValue = fn(evt)
      if (returnValue) {
        evt.preventDefault()
        evt.returnValue = returnValue
      }
      return returnValue
    }

    window.addEventListener('beforeunload', handleBeforeunload)
    return () => window.removeEventListener('beforeunload', handleBeforeunload)
  }, [fn])
}
