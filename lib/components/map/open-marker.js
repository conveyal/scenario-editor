import React from 'react'

import Marker from 'lib/components/map/marker'

export default function OpenMarker(props) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    ref.current.leafletElement.openPopup()
  }, [ref])

  return <Marker {...props} ref={ref} />
}
