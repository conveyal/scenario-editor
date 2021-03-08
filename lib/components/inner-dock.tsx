import {CSSProperties, useEffect, useRef, useState} from 'react'
import Simplebar from 'simplebar-react'

import useWindowSize from 'lib/hooks/use-window-size'

import 'simplebar/dist/simplebar.min.css'

const defaultStyle: CSSProperties = {
  position: 'relative', // prevents overflow from react-select
  overflowX: 'hidden',
  overflowY: 'auto',
  paddingBottom: '12px'
}

const defaultWidth = 320

/**
 * Sets the height to the window size to enable scrolling in the dock.
 */
export default function InnerDock({
  children,
  className = '',
  width = defaultWidth
}) {
  const ref = useRef<HTMLDivElement>()
  const windowSize = useWindowSize()
  const [height, setHeight] = useState<number | string>('100vh')
  useEffect(() => {
    if (ref.current && windowSize.height) {
      setHeight(windowSize.height - ref.current.offsetTop)
    }
  }, [ref, windowSize])

  return (
    <>
      <style global jsx>{`
        .simplebar-scrollbar::before {
          background-color: #e2e8f0;
        }
      `}</style>
      <Simplebar
        className={className}
        scrollableNodeProps={{ref}}
        style={{...defaultStyle, height, width}}
      >
        {children}
      </Simplebar>
    </>
  )
}
