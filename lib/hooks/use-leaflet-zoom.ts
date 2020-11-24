import {useEffect, useState} from 'react'
import {useLeaflet} from 'react-leaflet'

export default function useLeafletZoom(): number {
  const leaflet = useLeaflet()
  const [zoom, setZoom] = useState(leaflet.map.getZoom())

  useEffect(() => {
    const handleZoomEnd = () => setZoom(leaflet.map.getZoom())
    leaflet.map.on('zoomend', handleZoomEnd)
    return () => {
      leaflet.map.off('zoomend', handleZoomEnd)
    }
  }, [leaflet, setZoom])

  return zoom
}
