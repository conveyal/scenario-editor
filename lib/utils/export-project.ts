import {feature as toFeature, featureCollection} from '@turf/helpers'

import {ADD_TRIP_PATTERN, REROUTE} from 'lib/constants'

import downloadJson from './download-json'
import getStops from './get-stops'

export function downloadScenario(
  description: string,
  feeds: CL.FeedSummary[],
  modifications: CL.Modification[]
) {
  const feedChecksums = Object.fromEntries(
    feeds.map((feed) => [feed.feedId, feed.checksum])
  )

  downloadJson(
    {
      description,
      feedChecksums,
      _id: 0,
      modifications
    },
    `${description}.json`
  )
}

export function downloadLines(name: string, modifications: CL.Modification[]) {
  const features: GeoJSON.Feature[] = []

  for (const mod of modifications) {
    if (mod.type === ADD_TRIP_PATTERN || mod.type === REROUTE) {
      const feature: GeoJSON.Feature<GeoJSON.LineString> = toFeature(
        {
          type: 'LineString',
          coordinates: []
        },
        mod.type === ADD_TRIP_PATTERN
          ? {
              name: mod.name,
              bidirectional: mod.bidirectional,
              timetables: mod.timetables
            }
          : {
              name: mod.name
            }
      )
      if (mod.segments?.length > 0) {
        const start = mod.segments[0]
        if (start.geometry.type === 'LineString') {
          const coord = start.geometry.coordinates[0]
          feature.geometry.coordinates.push(coord)
          for (const seg of mod.segments) {
            if (seg.geometry.type === 'LineString') {
              feature.geometry.coordinates.push(
                ...seg.geometry.coordinates.slice(1)
              )
            }
          }
        }
      }
      features.push(feature)
    }
  }

  downloadJson(featureCollection(features), name + '-new-alignments.geojson')
}

export function downloadStops(name: string, modifications: CL.Modification[]) {
  const features: GeoJSON.Feature[] = []

  for (const mod of modifications) {
    if (mod.type === ADD_TRIP_PATTERN || mod.type === REROUTE) {
      getStops(mod.segments).forEach((stop) => {
        features.push(
          toFeature(
            {
              type: 'Point',
              coordinates: [stop.lng, stop.lat]
            },
            {
              name: mod.name,
              distanceFromStart: stop.distanceFromStart,
              stopId: stop.stopId
            }
          )
        )
      })
    }
  }

  downloadJson(featureCollection(features), name + '-new-stops.geojson')
}
