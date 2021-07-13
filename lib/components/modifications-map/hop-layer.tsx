import lineSlice from '@turf/line-slice'
import {point} from '@turf/helpers'
import uniq from 'lodash/uniq'
import {useMemo} from 'react'

import colors from 'lib/constants/colors'

import GeoJSON from '../map/geojson'

function useHopGeometries(
  hops: string[][],
  patterns: GTFS.Pattern[],
  stops: GTFS.Stop[]
) {
  const geojson = useMemo(() => {
    const selectedHopGeometries: GeoJSON.Feature[] = []

    // sort out the hops
    for (const pattern of patterns) {
      // figure out selected hop indices then merge consecutive hops
      let selectedHopIndicesInPattern: number[] = []
      for (const hop of hops) {
        // NB if same stop sequence appears twice, we'll only show the hop once.
        // This isn't that big a deal, as this is just a display
        const hopIndex = pattern.orderedStopIds.findIndex(
          (_, index, stops) =>
            index < stops.length - 1 &&
            stops[index] === hop[0] &&
            stops[index + 1] === hop[1]
        )

        if (hopIndex !== -1) selectedHopIndicesInPattern.push(hopIndex)
      }

      // to avoid excessive line segmentation operations, we find consecutive hops and show them all at once as a single feature
      // the lineSlice operation is pretty intensive
      // uniquify and sort
      selectedHopIndicesInPattern = uniq(selectedHopIndicesInPattern).sort()

      // merge consectuive hops
      // negative number less than -1 so it's not consecutive with hop 0
      let startHopIndex = -10
      let prevHopIndex = -10

      const makeGeometryIfNecessary = () => {
        // TODO: SIDE EFFECTS!!
        if (startHopIndex >= 0) {
          // get geometry
          const fromStopId = pattern.orderedStopIds[startHopIndex]
          const fromStop = stops.find((s) => s.id === fromStopId)
          // get feature at end of hop
          const toStopId = pattern.orderedStopIds[prevHopIndex + 1]
          const toStop = stops.find((s) => s.id === toStopId)
          const geometry = lineSlice(
            point([fromStop.lon, fromStop.lat]),
            point([toStop.lon, toStop.lat]),
            {
              type: 'Feature',
              properties: {},
              geometry: pattern.geometry
            }
          )

          selectedHopGeometries.push(geometry)
        }
      }

      for (const hopIndex of selectedHopIndicesInPattern) {
        if (startHopIndex < 0) startHopIndex = hopIndex

        if (hopIndex - 1 !== prevHopIndex && prevHopIndex >= 0) {
          // start of new hop sequence detected
          makeGeometryIfNecessary()
          startHopIndex = hopIndex
        }

        prevHopIndex = hopIndex
      }

      // last hop
      makeGeometryIfNecessary()
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: selectedHopGeometries
    }

    return geojson
  }, [hops, patterns, stops])

  return geojson
}

/** represent selected hops in an adjust-speed modification */
export default function HopLayer({
  color = colors.NEUTRAL,
  hops,
  patterns,
  stops
}: {
  color?: string
  hops: string[][]
  patterns: GTFS.Pattern[]
  stops: GTFS.Stop[]
}) {
  const geojson = useHopGeometries(hops, patterns, stops)
  return <GeoJSON data={geojson} color={color} />
}
