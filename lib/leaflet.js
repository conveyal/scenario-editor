import Leaflet from 'leaflet'

import {MB_TOKEN} from 'lib/constants'
const MB_URL = 'https://api.mapbox.com/styles/v1/conveyal'
const MB_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'conveyal/cjwu7oipd0bf41cqqv15huoim' // based off "Light"

/**
 * There were universal settings for Leaflet that made importing it from a local
 * file instead of the library a good idea.
 */
export default Leaflet
