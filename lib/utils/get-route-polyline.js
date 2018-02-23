// @flow
import lonlat from '@conveyal/lonlat'
import {decode as decodePolyline} from '@mapbox/polyline'
import fetch from 'isomorphic-fetch'

import type {LonLatC} from '../types'

const GRAPHHOPPER_API_URL = 'https://graphhopper.com/api/1/route'

export default async function getRoutePolyline (start: LonLatC, end: LonLatC) {
  const startPoint = lonlat.toLatFirstString(start)
  const endPoint = lonlat.toLatFirstString(end)
  const response = await fetch(`${GRAPHHOPPER_API_URL}?key=${process.env.GRAPHHOPPER_API_KEY || ''}&point=${startPoint}&point=${endPoint}&instructions=false`)
  const json = await response.json()

  return decodePolyline(json.paths[0].points).map(c => ([c[1], c[0]])) // [lat,lon] -> [lon,lat]
}
