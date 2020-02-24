import React from 'react'

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
    timeoutId = setTimeout(tick, interval)
    return () => clearTimeout(timeoutId)
  }, [interval])
}
