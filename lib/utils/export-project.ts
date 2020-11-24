import {ADD_TRIP_PATTERN, REROUTE} from 'lib/constants'

import cleanProjectScenarioName from './clean-project-scenario-name'
import downloadJson from './download-json'
import getStops from './get-stops'

export const downloadScenario = (project, feeds, modifications, index) => {
  const description = cleanProjectScenarioName(project, index)
  const feedChecksums = {}
  feeds.forEach((f) => {
    feedChecksums[f.id] = f.checksum
  })

  downloadJson({
    data: {
      description,
      feedChecksums,
      _id: 0,
      modifications: modifications.filter((m) => m.variants[index])
    },
    filename: `${description}.json`
  })
}

export const downloadLines = (project, modifications, index) => {
  const file = cleanProjectScenarioName(project, index)
  const features = []

  modifications
    .filter((m) => m.variants[index])
    .forEach((mod) => {
      if (mod.type === ADD_TRIP_PATTERN || mod.type === REROUTE) {
        const f = {
          type: 'Feature',
          properties: {
            name: mod.name,
            bidirectional: mod.bidirectional,
            timetables: mod.timetables
          },
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
        if (mod.segments?.length > 0) {
          const start = mod.segments[0]
          const coord = start.geometry.coordinates[0]
          f.geometry.coordinates.push(coord)
          mod.segments.forEach((seg) =>
            f.geometry.coordinates.push(...seg.geometry.coordinates.slice(1))
          )
        }
        features.push(f)
      }
    })

  saveAsGeoJson(features, file + '-new-alignments.geojson')
}

export const downloadStops = (project, modifications, index) => {
  const file = cleanProjectScenarioName(project, index)
  const features = []

  modifications
    .filter((m) => m.variants[index])
    .forEach((mod) => {
      if (mod.type === ADD_TRIP_PATTERN || mod.type === REROUTE) {
        getStops(mod.segments).forEach((stop) => {
          features.push({
            type: 'Feature',
            properties: {
              name: mod.name,
              distanceFromStart: stop.distanceFromStart,
              stopId: stop.stopId
            },
            geometry: {
              type: 'Point',
              coordinates: [stop.lng, stop.lat]
            }
          })
        })
      }
    })

  saveAsGeoJson(features, file + '-new-stops.geojson')
}

const saveAsGeoJson = (features, filename) => {
  downloadJson({
    data: {
      type: 'FeatureCollection',
      features
    },
    filename
  })
}
