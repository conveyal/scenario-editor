// @flow
import lonlat from '@conveyal/lonlat'
import React from 'react'
import {LayerGroup, Marker, Polyline} from 'react-leaflet'

import {NEW_LINE_WEIGHT} from '../../constants'
import colors from '../../constants/colors'
import {
  getNewStopIconForZoom,
  getSnappedStopIconForZoom,
  enlargeIconBy
} from '../map/circle-icons'
import DirectionalMarkers from '../directional-markers'
import getStops from '../../utils/get-stops'

import type {FeatureCollection, Segment, Stop} from '../../types'

type Props = {
  bidirectional: boolean,
  highlightSegment?: number,
  highlightStop?: any,
  segments: Segment[]
}

type State = {
  directionalMarkerPatterns: [
    {
      geometry: {
        coordinates: number[]
      }
    }
  ],
  geojson: FeatureCollection,
  stops: Stop[],
  stopRadius: number
}

/**
 * A layer to display (not edit) an added trip pattern
 */
export default class AddTripPatternLayer extends LayerGroup {
  props: Props
  state: State

  state = {
    ...getStateFromProps(this.props),
    newStopIcon: getNewStopIconForZoom(this.context.map.getZoom()),
    newSnappedStopIcon: getSnappedStopIconForZoom(this.context.map.getZoom())
  }

  componentDidMount () {
    super.componentDidMount()
    this.context.map.on('zoomend', this._onZoomend)
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.context.map.off('zoomend', this._onZoomend)
  }

  _onZoomend = () => {
    const z = this.context.map.getZoom()
    this.setState({
      newStopIcon: getNewStopIconForZoom(z),
      newSnappedStopIcon: getSnappedStopIconForZoom(z)
    })
  }

  render () {
    const {
      directionalMarkerPatterns,
      newStopIcon,
      newSnappedStopIcon,
      segmentsPolylinePositions,
      stops
    } = this.state
    const {
      bidirectional,
      highlightSegment,
      highlightStop,
      segments
    } = this.props
    return (
      <g>
        <Polyline
          color={colors.ADDED}
          positions={segmentsPolylinePositions}
          weight={NEW_LINE_WEIGHT}
        />
        {highlightSegment !== undefined &&
          highlightSegment > -1 &&
          <Polyline
            color={colors.HIGHLIGHT}
            opacity={0.5}
            positions={segments[highlightSegment].geometry.coordinates.map(c => lonlat.toLeaflet(c))}
            weight={NEW_LINE_WEIGHT * 3}
          />}
        {!bidirectional &&
          <DirectionalMarkers
            color={colors.ADDED}
            patterns={directionalMarkerPatterns}
          />}
        {stops.map((s, i) =>
          <Marker
            icon={s.stopId ? newSnappedStopIcon : newStopIcon}
            key={`stop-${i}`}
            position={s}
          />)}
        {highlightStop &&
          <Marker
            icon={enlargeIconBy(highlightStop.stopId ? newSnappedStopIcon : newStopIcon, 2)}
            position={highlightStop}
          />}
      </g>
    )
  }
}

function getStateFromProps (props) {
  const coordinates = getCoordinatesFromSegments(props.segments)
  return {
    directionalMarkerPatterns: [{geometry: {coordinates}}],
    segmentsPolylinePositions: coordinates.map(c => lonlat.toLeaflet(c)),
    stops: getStops(props.segments)
  }
}

function getCoordinatesFromSegments (segments) {
  // smoosh all segments together
  const coordinates = [].concat(
    ...segments.map(({geometry}) => geometry.coordinates.slice(0, -1))
  )
  // add last coordinate
  coordinates.push(segments.slice(-1)[0].geometry.coordinates.slice(-1)[0])

  return coordinates
}
