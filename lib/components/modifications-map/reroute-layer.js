// @flow
import lineSlice from '@turf/line-slice'
import {point} from '@turf/helpers'
import isEqual from 'lodash/isEqual'
import React, {PureComponent} from 'react'
import {CircleMarker, FeatureGroup, GeoJSON} from 'react-leaflet'
import uuid from 'uuid'

import colors from '../../constants/colors'
import DirectionalMarkers from '../directional-markers'
import PatternGeometry from '../map/geojson-patterns'
import {getPatternsForModification} from '../../utils/patterns'
import type {FeatureCollection, Pattern} from '../../types'

type DefaultProps = {
  addedColor: string,
  color: string,
  removedColor: string,
  showAddedSegment: boolean
}

type Props = {
  addedColor: string,
  color: string,
  dim: boolean,
  feed: any,
  highlightSegment: number,
  highlightStop: any,
  modification: any,
  removedColor: string,
  // should the added segment be shown? False if we are editing it and don't want to show it twice.
  showAddedSegment: boolean
}

type State = {
  addedSegments: FeatureCollection,
  feedsLoaded: boolean,
  patterns: Pattern[],
  patternsLoaded: boolean,
  removedSegments: FeatureCollection,
  uuid: string
}

const LINE_WEIGHT = 3
const STOP_RADIUS = 2.5

/**
 * A layer showing a reroute modification
 */
export default class RerouteLayer
  extends PureComponent<DefaultProps, Props, State> {
  static defaultProps = {
    color: colors.NEUTRAL,
    removedColor: colors.REMOVED,
    addedColor: colors.ADDED,
    showAddedSegment: true
  }

  state = getStateFromProps(this.props)

  componentWillReceiveProps (nextProps: Props) {
    if (!isEqual(nextProps, this.props)) {
      this.setState(getStateFromProps(nextProps))
    }
  }

  render () {
    const {dim, highlightSegment, highlightStop, showAddedSegment} = this.props
    const {
      addedSegments,
      feedsLoaded,
      patterns,
      patternsLoaded,
      removedSegments,
      uuid
    } = this.state

    if (patternsLoaded && feedsLoaded) {
      return (
        <FeatureGroup>
          <PatternGeometry color={colors.NEUTRAL} patterns={patterns} />
          <DirectionalMarkers color={colors.NEUTRAL} patterns={patterns} />
          <GeoJSON
            data={removedSegments}
            color={colors.REMOVED}
            opacity={dim ? 0.1 : 1}
            weight={LINE_WEIGHT}
            key={`${uuid}-removed-segments`}
          />
          {showAddedSegment &&
            <GeoJSON
              data={addedSegments}
              color={colors.ADDED}
              opacity={dim ? 0.1 : 1}
              weight={LINE_WEIGHT}
              key={`${uuid}-added-segments}`}
            />}
          {highlightSegment > -1 &&
            <GeoJSON
              data={addedSegments.features[highlightSegment]}
              color={colors.ACTIVE}
              key={`${uuid}-highlight-segment-${highlightSegment}`}
              weight={LINE_WEIGHT * 2}
            />}
          {highlightStop &&
            <CircleMarker
              center={[highlightStop.lat, highlightStop.lon]}
              fillOpacity={1}
              color={colors.ACTIVE}
              radius={STOP_RADIUS * 2}
            />}
        </FeatureGroup>
      )
    } else {
      return <span />
    }
  }
}

function getStateFromProps ({dim, feed, modification}: Props) {
  const addedSegments = {
    type: 'FeatureCollection',
    features: modification.segments.map(segment => {
      return {
        type: 'Feature',
        geometry: segment.geometry,
        properties: {}
      }
    })
  }

  const patterns = getPatternsForModification({dim, feed, modification})
  const removedSegments: any[] = (patterns || [])
    .map(pattern => {
      // make sure the modification applies to this pattern. If the modification
      // doesn't have a start or end stop, just use the first/last stop as this is
      // just for display and we can't highlight past the stops anyhow
      const fromStopIndex = modification.fromStop != null
        ? pattern.stops.findIndex(s => s.stop_id === modification.fromStop)
        : 0
      // make sure to find a toStopIndex _after_ the fromStopIndex (helps with loop routes also)
      const toStopIndex = modification.toStop != null
        ? pattern.stops.findIndex(
          (s, i) => i > fromStopIndex && s.stop_id === modification.toStop
        )
        : pattern.stops.length - 1

      const modificationAppliesToThisPattern =
        fromStopIndex !== -1 && toStopIndex !== -1
      if (modificationAppliesToThisPattern) {
        // NB using indices here so we get an object even if fromStop or toStop
        // is null stops in pattern are in fact objects but they only have stop ID.
        const fromStop = feed.stopsById[pattern.stops[fromStopIndex].stop_id]
        const toStop = feed.stopsById[pattern.stops[toStopIndex].stop_id]

        return lineSlice(
          point([fromStop.stop_lon, fromStop.stop_lat]),
          point([toStop.stop_lon, toStop.stop_lat]),
          {
            type: 'Feature',
            geometry: pattern.geometry,
            properties: {}
          }
        )
      }
    })
    .filter(segment => !!segment)

  return {
    addedSegments,
    feedsLoaded: !!feed,
    patterns,
    patternsLoaded: !!patterns,
    removedSegments: {
      type: 'FeatureCollection',
      features: removedSegments
    },
    uuid: uuid.v4()
  }
}
