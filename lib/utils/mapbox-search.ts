import throttle from 'lodash/throttle'
import get from 'lodash/get'
import {stringify} from 'querystring'

import {MB_TOKEN} from 'lib/constants'

const DELAY_MS = 400
const BASE_URL = 'https://api.mapbox.com'
const PATH = '/geocoding/v5/mapbox.places'
const getURL = (s: string, q: string) =>
  `${BASE_URL}${PATH}/${encodeURIComponent(s)}.json?${q}`

/**
 * Mapbox adds properties to a normal featuer.
 * https://docs.mapbox.com/api/search/#geocoding-response-object
 */
export interface MapboxFeature extends GeoJSON.Feature {
  center: [number, number] // lon/lat
}

type SearchCallback = (features: MapboxFeature[]) => void

/**
 * Using callbacks in order to handle throttling appropriately.
 */
export default throttle(function mapboxSearch(
  s: string,
  options = {},
  cb: SearchCallback
) {
  if (get(s, 'length') < 3) return cb([])

  const querystring = stringify({
    access_token: MB_TOKEN,
    autocomplete: false,
    // All types except `country` and `poi`: https://docs.mapbox.com/api/search/geocoding/#data-types
    types: 'region,district,locality,postcode,place,neighborhood,address',
    ...options
  })

  fetch(getURL(s, querystring))
    .then((r) => r.json())
    .then((json) => cb(json.features))
    .catch((e) => {
      console.error(e)
      cb([])
    })
},
DELAY_MS)
