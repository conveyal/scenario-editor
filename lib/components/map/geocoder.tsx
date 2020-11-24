import lonlat from '@conveyal/lonlat'
import type {LatLngBoundsExpression} from 'leaflet'
import fpGet from 'lodash/fp/get'
import {CSSProperties, useCallback} from 'react'
import Select from 'react-select/async'

import mapboxSearch, {MapboxFeature} from 'lib/utils/mapbox-search'

import {selectStyles} from '../select'

const geocoderStyle: CSSProperties = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  width: '296px',
  zIndex: 1000
}

const getPlaceName = fpGet('place_name')
const getId = fpGet('id')

type GeocoderProps = {
  isDisabled?: boolean
  map: void | L.Map
}

export default function Geocoder({isDisabled, map}: GeocoderProps) {
  const panToResult = useCallback(
    (r: MapboxFeature) => {
      if (r && map) {
        if (r.bbox) {
          const [west, south, east, north] = r.bbox
          const bounds: LatLngBoundsExpression = [
            [south, west],
            [north, east]
          ]
          map.fitBounds(bounds)
        } else {
          map.setView([r.center[1], r.center[0]], 19)
        }
        map.fire('geocode', r)
      }
    },
    [map]
  )

  const searchWithProximity = useCallback(
    (t: string, callback) => {
      mapboxSearch(
        t,
        {
          proximity: map ? lonlat.toString(map.getCenter()) : ''
        },
        callback
      )
    },
    [map]
  )

  return (
    <div style={geocoderStyle}>
      <Select
        inputId='geocoder'
        isDisabled={isDisabled}
        getOptionLabel={getPlaceName}
        getOptionValue={getId}
        loadOptions={searchWithProximity}
        onChange={panToResult}
        placeholder='Search map...'
        styles={selectStyles}
      />
    </div>
  )
}
