/** represent selected hops in an adjust-speed modification */
import React from 'react'
import {GeoJSON, MapComponent} from 'react-leaflet'
import lineSlice from '@turf/line-slice'
import {point} from '@turf/helpers'
import {v4 as uuidv4} from 'uuid'

import colors from '../../constants/colors'
import {getPatternsForModification} from '../../utils/patterns'

export default class HopLayer extends MapComponent {
  static defaultProps = {
    color: colors.NEUTRAL
  }

  render() {
    const {color, dim, feed, modification} = this.props
    const patterns = getPatternsForModification({dim, feed, modification})
    const patternsLoaded = !!patterns
    if (patternsLoaded) {
      const selectedHopGeometries = []

      // sort out the hops
      for (const pattern of patterns) {
        // figure out selected hop indices then merge consecutive hops
        let selectedHopIndicesInPattern = []
        for (const hop of this.props.modification.hops) {
          // NB if same stop sequence appears twice, we'll only show the hop once.
          // This isn't that big a deal, as this is just a display
          const hopIndex = pattern.stops.findIndex(
            (stop, index, stops) =>
              index < stops.length - 1 &&
              stops[index].stop_id === hop[0] &&
              stops[index + 1].stop_id === hop[1]
          )

          if (hopIndex !== -1) selectedHopIndicesInPattern.push(hopIndex)
        }

        // to avoid excessive line segmentation operations, we find consecutive hops and show them all at once as a single feature
        // the lineSlice operation is pretty intensive
        // uniquify and sort
        selectedHopIndicesInPattern = [
          ...new Set(selectedHopIndicesInPattern)
        ].sort()

        // merge consectuive hops
        // negative number less than -1 so it's not consecutive with hop 0
        let startHopIndex = -10
        let prevHopIndex = -10

        const makeGeometryIfNecessary = () => {
          // TODO: SIDE EFFECTS!!
          if (startHopIndex >= 0) {
            // get geometry
            const fromStopId = pattern.stops[startHopIndex].stop_id
            const fromStop = feed.stopsById[fromStopId]
            // get feature at end of hop
            const toStopId = pattern.stops[prevHopIndex + 1].stop_id
            const toStop = feed.stopsById[toStopId]
            const geometry = lineSlice(
              point([fromStop.stop_lon, fromStop.stop_lat]),
              point([toStop.stop_lon, toStop.stop_lat]),
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

      const data = {
        type: 'FeatureCollection',
        features: selectedHopGeometries
      }

      return <GeoJSON data={data} color={color} key={uuidv4()} zIndex={10000} />
    }

    return <span />
  }
}
