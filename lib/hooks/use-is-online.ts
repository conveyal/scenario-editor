import {useEffect, useState} from 'react'

export default function useIsOnline() {
  const [isOnline, setOnline] = useState(
    process.browser && window.navigator.onLine
  )

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setOnline])

  return isOnline
}
