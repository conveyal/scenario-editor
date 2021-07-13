import distance from '@turf/distance'
import shp from 'shpjs'

import message from 'lib/message'
import {create as createTimetable} from 'lib/utils/timetable'
import {postJSON} from 'lib/utils/safe-fetch'

const apiUrl = '/api/modification/create-from-shapefile'

/**
 * Make LineStrings look like MultiLineStrings.
 */
function getCoordinatesFromFeature(
  feature: GeoJSON.Feature
): GeoJSON.Position[][] {
  if (feature.geometry.type === 'LineString') {
    return [(feature.geometry as GeoJSON.LineString).coordinates]
  } else if (feature.geometry.type === 'MultiLineString') {
    const coords = (feature.geometry as GeoJSON.MultiLineString).coordinates
    for (let i = 1; i < coords.length; i++) {
      // Ensure MultiLineStrings line up at the ends.
      if (distance(coords[i - 1].slice(-1)[0], coords[i][0]) > 0.05) {
        throw new Error(message('shapefile.invalidMultiLineString'))
      }
    }
    return coords
  } else {
    throw new Error(message('shapefile.invalidShapefileType'))
  }
}

export default function createModificationsFromShapefile(
  projectId: string,
  shapefile: shp.FeatureCollectionWithFilename,
  autoCreateStops: boolean,
  stopSpacingMeters: number,
  bidirectional: boolean,
  nameKey: string,
  speedKey: string,
  frequencyKey: string
) {
  const modifications: Partial<CL.AddTripPattern>[] = shapefile.features.map(
    (feat, i) => {
      const segments = []
      const coords: GeoJSON.Position[][] = getCoordinatesFromFeature(feat)

      // Make a segment from each LineString.
      for (let i = 0; i < coords.length; i++) {
        segments.push({
          geometry: {
            type: 'LineString',
            coordinates: coords[i]
          },
          spacing: autoCreateStops ? stopSpacingMeters : 0,
          stopAtStart: false,
          stopAtEnd: false,
          fromStopId: null,
          toStopId: null
        })
      }

      if (segments.length > 0) {
        segments[0].stopAtStart = true
        segments[segments.length - 1].stopAtEnd = true
      }

      const timetable = createTimetable(
        segments.map(() => feat.properties[speedKey])
      )
      timetable.headwaySecs = feat.properties[frequencyKey] * 60

      return {
        bidirectional,
        name: feat.properties[nameKey] ?? `Add Trip Pattern ${i}`,
        segments,
        timetables: [timetable]
      }
    }
  )

  const requestBody = {
    modifications,
    projectId
  }

  return postJSON<typeof requestBody, string[]>(apiUrl, requestBody)
}
