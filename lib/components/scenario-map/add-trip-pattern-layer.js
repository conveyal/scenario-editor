// @flow
import lonlat from '@conveyal/lonlat'
import isEqual from 'lodash/isEqual'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'
import {FeatureGroup, GeoJson, CircleMarker} from 'react-leaflet'
import uuid from 'uuid'

import colors from '../../constants/colors'
import DirectionalMarkers from '../directional-markers'
import getStops from '../../utils/get-stops'

import {Coordinate, FeatureCollection, GTFSStop, Segment, Stop} from '../../types'

type Props = {
  bidirectional: boolean,
  highlightSegment?: number,
  highlightStop?: GTFSStop,
  segments: Segment[]
}

type State = {
  directionalMarkerPatterns: [{
    geometry: {
      coordinates: Coordinate[]
    }
  }],
  key: string,
  geojson: FeatureCollection,
  stops: Stop[]
}

const LINE_WEIGHT = 3
const STOP_RADIUS = 2.5

/**
 * A layer to display (not edit) an added trip pattern
 */
export default class AddTripPatternLayer extends PureComponent<void, Props, State> {
  state = getStateFromProps(this.props)

  componentWillReceiveProps (newProps: Props) {
    if (!isEqual(newProps, this.props)) this.setState(getStateFromProps(newProps))
  }

  render () {
    const {directionalMarkerPatterns, geojson, key, stops} = this.state
    const {bidirectional, highlightSegment, highlightStop, segments} = this.props
    return <FeatureGroup>
      <GeoJson
        data={geojson}
        color={colors.ADDED}
        key={key}
        weight={LINE_WEIGHT}
        />
      {highlightSegment !== undefined && highlightSegment > -1 &&
        <GeoJson
          data={segments[highlightSegment].geometry}
          color={colors.ACTIVE}
          fillOpacity={1}
          key={`${key}-highlight-segment`}
          weight={LINE_WEIGHT * 2}
          />}
      {!bidirectional &&
        <DirectionalMarkers
          color={colors.ADDED}
          key={`${key}-directional-markers`}
          patterns={directionalMarkerPatterns}
          />}
      <StopIcons id={`${key}-stop-icons`} stops={stops} />
      {highlightStop &&
        <CircleMarker
          center={[highlightStop.lat, highlightStop.lon]}
          fillOpacity={1}
          color={colors.ACTIVE}
          radius={STOP_RADIUS * 2}
        />}
    </FeatureGroup>
  }
}

function getStateFromProps (props) {
  const coordinates = getCoordinatesFromSegments(props.segments)
  return {
    directionalMarkerPatterns: [{geometry: {coordinates}}],
    geojson: getFeatureCollectionFromLineSegments(props.segments),
    key: uuid.v4(),
    stops: getStops(props.segments)
  }
}

function getCoordinatesFromSegments (segments) {
  // smoosh all segments together
  const coordinates = [].concat(...segments.map(({geometry}) => geometry.coordinates.slice(0, -1)))
  // add last coordinate
  coordinates.push(segments.slice(-1)[0].geometry.coordinates.slice(-1)[0])

  return coordinates
}

function getFeatureCollectionFromLineSegments (segments) {
  return {
    type: 'FeatureCollection',
    features: segments.map(({geometry}) => {
      return {
        type: 'Feature',
        properties: {},
        geometry
      }
    })
  }
}

const toLeaflet = memoize(
  (center) => lonlat.toLeaflet(center),
  (center) => lonlat.toString(center)
)

const StopIcons = ({
  id,
  stops
}) => <g>{stops.map((stop, idx) =>
  <CircleMarker
    center={toLeaflet(stop.center)}
    key={`${id}-${idx}`}
    color={colors.ADDED}
    radius={STOP_RADIUS}
  />)}</g>
