import {Marker, MarkerProps} from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype['_getIconUrl']

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/static/leaflet/dist/images/marker-icon-2x.png',
  iconUrl: '/static/leaflet/dist/images/marker-icon.png',
  shadowUrl: '/static/leaflet/dist/images/marker-shadow.png'
})

export default function CLMarker(p: MarkerProps) {
  return <Marker {...p} />
}
