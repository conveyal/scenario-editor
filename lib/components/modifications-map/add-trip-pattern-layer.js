// @flow
import lonlat from '@conveyal/lonlat'
import React from 'react'
import {CircleMarker, LayerGroup, Polyline} from 'react-leaflet'

import {
  HIGHLIGHT_SEGMENT_COLOR,
  NEW_SNAPPED_STOP_COLOR,
  NEW_STOP_COLOR,
  NEW_LINE_COLOR,
  NEW_LINE_WEIGHT
} from '../../constants'
import DirectionalMarkers from '../directional-markers'
import getStops from '../../utils/get-stops'
import getStopRadius from '../../utils/get-stop-radius'

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
    stopRadius: getStopRadius(this.context.map.getZoom())
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
    this.setState({stopRadius: getStopRadius(this.context.map.getZoom())})
  }

  render () {
    const {directionalMarkerPatterns, segmentsPolylinePositions, stops, stopRadius} = this.state
    const {
      bidirectional,
      highlightSegment,
      highlightStop,
      segments
    } = this.props
    return (
      <g>
        <Polyline
          color={NEW_LINE_COLOR}
          positions={segmentsPolylinePositions}
          weight={NEW_LINE_WEIGHT}
        />
        {highlightSegment !== undefined &&
          highlightSegment > -1 &&
          <Polyline
            color={HIGHLIGHT_SEGMENT_COLOR}
            opacity={0.5}
            positions={segments[highlightSegment].geometry.coordinates.map(c => lonlat.toLeaflet(c))}
            weight={NEW_LINE_WEIGHT * 3}
          />}
        {!bidirectional &&
          <DirectionalMarkers
            color={NEW_LINE_COLOR}
            patterns={directionalMarkerPatterns}
          />}
        {stops.map((s, i) =>
          <CircleMarker
            center={s}
            color={s.stopId ? NEW_SNAPPED_STOP_COLOR : NEW_STOP_COLOR}
            fill
            fillColor='#fff'
            fillOpacity={1}
            key={`stop-${i}`}
            radius={stopRadius}
            weight={stopRadius / 3}
          />)}
        {highlightStop &&
          <CircleMarker
            center={highlightStop}
            fillOpacity={1}
            color={highlightStop.stopId ? NEW_SNAPPED_STOP_COLOR : NEW_STOP_COLOR}
            radius={stopRadius * 2}
            weight={stopRadius / 3}
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
