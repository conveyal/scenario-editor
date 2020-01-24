import React from 'react'

import useWindowSize from 'lib/hooks/use-window-size'

/**
 * Sets the height to the window size to enable scrolling in the dock.
 */
export default function InnerDock(p) {
  const el = React.useRef()
  const windowSize = useWindowSize()
  const height =
    windowSize.height && el.current
      ? windowSize.height - el.current.offsetTop
      : '100vh'

  return (
    <div
      className={`InnerDock ${p.className || ''}`}
      ref={el}
      style={{...p.style, height}}
    >
      {p.children}
    </div>
  )
}
