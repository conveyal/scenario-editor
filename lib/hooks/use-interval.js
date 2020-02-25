import React from 'react'

/**
 * TODO replace fetches with useSWR.
 */
export default function useInterval(callback, interval) {
  const savedCallback = React.useRef()

  // Remember the latest callback
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  React.useEffect(() => {
    let timeoutId = null
    function tick() {
      savedCallback.current()
      timeoutId = setTimeout(tick, interval)
    }
    // Run once to start
    tick()
    // Clear timeout on unmount
    return () => clearTimeout(timeoutId)
  }, [interval])
}
