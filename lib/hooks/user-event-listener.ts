import {useRef, useEffect} from 'react'

export default function useEventListener(
  eventName: string,
  handler: EventListener,
  element = global,
  options: AddEventListenerOptions = {}
) {
  const savedHandler = useRef<EventListener>()
  const {capture, passive, once} = options

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) {
      return
    }

    const eventListener = (event: Event) =>
      savedHandler.current && savedHandler.current(event)
    const opts = {capture, passive, once}
    element.addEventListener(eventName, eventListener, opts)
    return () => {
      element.removeEventListener(eventName, eventListener, opts)
    }
  }, [eventName, element, capture, passive, once])
}
