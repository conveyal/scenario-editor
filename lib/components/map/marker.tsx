import {Marker} from 'react-leaflet'
import L from 'leaflet'

const icon = L.icon({
  iconRetinaUrl: '/static/leaflet/dist/images/marker-icon.png',
  iconUrl: '/static/leaflet/dist/images/marker-icon.png',
  shadowUrl: '/static/leaflet/dist/images/marker-shadow.png'
})

export default function CLMarker(p) {
  return <Marker {...p} icon={icon} />
}
