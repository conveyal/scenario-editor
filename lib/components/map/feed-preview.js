// @flow
import React, {Component} from 'react'
import {FeatureGroup, GeoJson} from 'react-leaflet'
import uuid from 'uuid'

import StopLayer from '../scenario-map/transit-editor/stop-layer'

import type {FeatureCollection, LineString} from '../../types'

type Props = {
  feed: {
    routes: Array<{
      patterns: Array<{
        geometry: LineString
      }>
    }>,
    stops: Array<{
      stop_lat: number,
      stop_lon: number
    }>
  }
}

type State = {
  routeFeatureCollection: FeatureCollection
}

export default class Feed extends Component<void, Props, State> {
  state = {
    routeFeatureCollection: routesToFeatureCollection(this.props.feed.routes)
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({
      routeFeatureCollection: routesToFeatureCollection(nextProps.feed.routes)
    })
  }

  render () {
    const color = '#d9534f'
    return (
      <FeatureGroup>
        <GeoJson
          color={color}
          data={this.state.routeFeatureCollection}
          key={uuid.v4()}
          opacity={0.5}
          weight={1}
          />
        <StopLayer
          stops={this.props.feed.stops}
          strokeStyle={color}
          />
      </FeatureGroup>
    )
  }
}

function routesToFeatureCollection (routes) {
  return {
    type: 'FeatureCollection',
    features: (routes || [])
      .filter((route) => !!route.patterns)
      .reduce((patterns, route) => [
        ...patterns,
        ...route.patterns
          .filter((pattern) => !!pattern.geometry)
          .map((pattern) => ({
            ...pattern.geometry
          }))
      ], [])
  }
}
