// @flow
import lonlat from '@conveyal/lonlat'
import message from '@conveyal/woonerf/message'
import Leaflet from 'leaflet'
import React from 'react'
import {
  LayerGroup,
  Polyline,
  Popup
} from 'react-leaflet'

import {
  MINIMUM_SNAP_STOP_ZOOM_LEVEL,
  NEW_SNAPPED_STOP_COLOR,
  NEW_STOP_COLOR
} from '../../../constants'

import {Button} from '../../buttons'
import DraggableCircleMarker from '../../map/draggable-circle-marker'
import getStopsFromSegments from '../../../utils/get-stops'
import getNearestStopToPoint from '../../../utils/get-stop-near-point'
import getLineString from '../../../utils/get-line-string'
import getStopRadius from '../../../utils/get-stop-radius'
import GTFSStopGridLayer from './gtfs-stop-gridlayer'

import type {Feed, LonLatC, Modification} from '../../../types'

const runAsync = (as) => as().catch(e => { console.error(e); throw e })
const coordinatesFromSegment = (segment, end = false) => segment.geometry.type === 'Point'
  ? segment.geometry.coordinates
  : end ? segment.geometry.coordinates.slice(-1)[0] : segment.geometry.coordinates[0]

type Props = {
  allowExtend: boolean,
  extendFromEnd: boolean,
  feeds: Feed[],
  followRoad: boolean,
  modification: Modification,
  spacing: number,
  updateModification: (any) => void
}

type State = {
  stopRadius: number
}

export default class TransitEditor extends LayerGroup {
  props: Props
  state: State

  state = {
    ...getStateFromProps(this.props),
    stopRadius: getStopRadius(this.context.map.getZoom())
  }

  componentWillReceiveProps (newProps: Props) {
    if (this.props.modification.segments !== newProps.modification.segments ||
      this.props.feeds !== newProps.feeds) {
      this.setState(getStateFromProps(newProps))
    }
  }

  componentDidMount () {
    super.componentDidMount()
    const {map} = this.context
    // this is pretty cloogy but I can't figure out how to use react-leaflet events to listen to parent events.
    map.on('click', this._handleMapClick)
    // map.on('mousemove', this._handleMouseMove)
    map.on('zoomend', this._setIconSize)

    // Focus the map on the routes
    const bounds = new Leaflet.LatLngBounds()
    const segments = this._getSegments()
    if (segments.length > 0 && segments[0].geometry.type !== 'Point') {
      for (const segment of segments) {
        const coordinates = segment.geometry.coordinates
        for (const coord of coordinates) {
          bounds.extend([coord[1], coord[0]])
        }
      }
      map.fitBounds(bounds)
    }
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    const {map} = this.context
    map.off('click', this._handleMapClick)
    // map.off('mousemove', this._handleMouseMove)
    map.off('zoomend', this._setIconSize)
  }

  _setIconSize = () => {
    this.setState({
      stopRadius: getStopRadius(this.context.map.getZoom())
    })
  }

  render () {
    const {
      controlPoints,
      gtfsStops,
      mouseOverLineString,
      segmentFeatures,
      stops,
      stopRadius
    } = this.state
    return (
      <g>
        {mouseOverLineString &&
          <Polyline
            positions={mouseOverLineString}
          />}
        <GTFSStopGridLayer stops={gtfsStops} />
        {segmentFeatures
          .map((feature, index) => (
            <Polyline
              key={`segment-${index}`}
              onClick={this._clickSegment(index)}
              positions={feature}
            />
          ))}
        {stops.filter(s => s.autoCreated).map((stop, i) =>
          <DraggableCircleMarker
            center={stop}
            color={NEW_STOP_COLOR}
            draggable
            fill
            fillColor='#fff'
            fillOpacity={0.5}
            key={`auto-created-stop-${i}-${lonlat.toString(stop)}`}
            onClick={this._dragAutoCreatedStop(stop.index)}
            onDragend={this._dragAutoCreatedStop(stop.index)}
            opacity={0.5}
            radius={stopRadius}
            weight={stopRadius / 3}
          />)}
        {controlPoints.map(controlPoint =>
          <DraggableCircleMarker
            center={controlPoint.position}
            draggable
            fill
            fillColor={NEW_SNAPPED_STOP_COLOR}
            fillOpacity={1}
            key={`control-point-${controlPoint.index}-${lonlat.toString(controlPoint.position)}`}
            onDragend={this._dragControlPoint(controlPoint.index)}
            radius={stopRadius}
            stroke={false}
          >
            <Popup>
              <div>
                <Button style='primary' onClick={this._toggleControlPoint(controlPoint.index)}>
                  {message('transitEditor.makeStop')}
                </Button>&nbsp;
                <Button style='danger' onClick={this._deleteStopOrPoint(controlPoint.index)}>
                  {message('transitEditor.deletePoint')}
                </Button>
              </div>
            </Popup>
          </DraggableCircleMarker>)}
        {stops.filter(s => !s.autoCreated).map(stop =>
          <DraggableCircleMarker
            center={stop}
            color={stop.stopId ? NEW_SNAPPED_STOP_COLOR : NEW_STOP_COLOR}
            draggable
            fill
            fillColor='#fff'
            fillOpacity={1}
            key={`stop-${stop.index}-${lonlat.toString(stop)}`}
            onDragend={this._dragStop(stop.index)}
            radius={stopRadius}
            weight={stopRadius / 3}
          >
            <Popup>
              <div>
                <Button style='primary' onClick={this._toggleStop(stop.index)}>
                  {message('transitEditor.makeControlPoint')}
                </Button>&nbsp;
                <Button style='danger' onClick={this._deleteStopOrPoint(stop.index)}>
                  {message('transitEditor.deletePoint')}
                </Button>
              </div>
            </Popup>
          </DraggableCircleMarker>)}
      </g>
    )
  }

  /**
   * Get a stop ID at the specified location, or null if this is not near a stop
   */
  _getStopNear (pointClickedOnMap: LonLatC) {
    const zoom = this.context.map.getZoom()
    if (zoom >= MINIMUM_SNAP_STOP_ZOOM_LEVEL) {
      return getNearestStopToPoint(pointClickedOnMap, this.state.gtfsStops, zoom)
    }
  }

  _getSegments () {
    return [...(this.props.modification.segments || [])]
  }

  /**
   * Handle a user clicking on the map
   */
  _handleMapClick = (event: Leaflet.MouseEvent) => {
    const {allowExtend, extendFromEnd, followRoad, spacing, updateModification} = this.props
    if (allowExtend) {
      runAsync(async () => {
        let coordinates = lonlat.toCoordinates(event.latlng)
        let segments = this._getSegments()
        const snapStop = this._getStopNear(event.latlng)

        let stopId
        if (snapStop) {
          stopId = snapStop.stop_id
          coordinates = [snapStop.stop_lon, snapStop.stop_lat]
        }

        if (segments.length > 0) {
          if (extendFromEnd) {
            // Insert a segment at the end
            const lastSegment = segments[segments.length - 1]
            const from = coordinatesFromSegment(lastSegment, true)

            segments = [...segments, {
              fromStopId: lastSegment.toStopId,
              geometry: await getLineString(from, coordinates, {followRoad}),
              spacing,
              stopAtEnd: true,
              stopAtStart: lastSegment.stopAtEnd,
              toStopId: stopId
            }]
          } else {
            const firstSegment = segments[0]
            const to = coordinatesFromSegment(firstSegment)

            segments = [{
              fromStopId: stopId,
              geometry: await getLineString(coordinates, to, {followRoad}),
              spacing,
              stopAtEnd: firstSegment.stopAtStart,
              stopAtStart: true,
              toStopId: firstSegment.fromStopId
            }, ...segments]
          }

          // Remove all leftover point features
          segments = segments.filter(s => s.geometry.type !== 'Point')
        } else {
          segments[0] = {
            fromStopId: stopId,
            geometry: {
              type: 'Point',
              coordinates: lonlat.toCoordinates(coordinates)
            },
            spacing,
            stopAtEnd: true,
            stopAtStart: true,
            toStopId: stopId
          }
        }

        updateModification({segments})
      })
    }
  }

  /**
   * Show a stop and segment from the mousepoint
   */
  _handleMouseMove = (event: Leaflet.MouseEvent) => {
    const segments = this._getSegments()

    this.setState({
      cursorPosition: event.latlng
    })

    if (segments.length > 0) {
      const {extendFromEnd, followRoad} = this.props
      let start, end
      if (extendFromEnd) {
        start = lonlat.toLeaflet(coordinatesFromSegment(segments.slice(-1)[0], true))
        end = event.latlng
      } else {
        start = event.latlng
        end = lonlat.toLeaflet(coordinatesFromSegment(segments[0], false))
      }

      this.setState({
        mouseOverLineString: [start, end]
      })

      if (followRoad) {
        // TODO debounce the follow road function so it only runs when you stop moving the mouse for a few seconds
      }
    }
  }

  _dragAutoCreatedStop = (index: number) => (event: Leaflet.MouseEvent) => {
    Leaflet.DomEvent.stop(event)
    this._insertStop(lonlat.toCoordinates(event.latlng), index)
  }

  _dragStop = (index: number) => (event: Leaflet.MouseEvent) => {
    console.log('_dragStop')
    Leaflet.DomEvent.stop(event)
    const {followRoad, updateModification} = this.props
    const segments = this._getSegments()
    const position = event.latlng
    const snapStop = this._getStopNear(position)
    const isEnd = index === segments.length
    const isStart = index === 0

    let coordinates = lonlat.toCoordinates(position)
    let newStopId
    if (snapStop) {
      newStopId = snapStop.stop_id
      coordinates = [snapStop.stop_lon, snapStop.stop_lat]
    }

    runAsync(async () => {
      if (!isStart) {
        const previousSegment = segments[index - 1]
        // will overwrite geometry and preserve other attributes
        segments[index - 1] = {
          ...previousSegment,
          toStopId: newStopId,
          geometry: await getLineString(coordinatesFromSegment(previousSegment), coordinates, {followRoad})
        }
      }

      if (!isEnd) {
        const nextSegment = segments[index]
        segments[index] = {
          ...nextSegment,
          fromStopId: newStopId,
          geometry: await getLineString(coordinates, coordinatesFromSegment(nextSegment, true), {followRoad})
        }
      }

      updateModification({segments})
    })
  }

  _toggleStop = (index: number) => () => {
    const segments = this._getSegments()
    if (index < segments.length) {
      segments[index] = {
        ...segments[index],
        stopAtStart: false,
        fromStopId: null
      }
    }

    if (index > 0) {
      segments[index - 1] = {
        ...segments[index - 1],
        stopAtEnd: false,
        toStopId: null
      }
    }

    this.props.updateModification({segments})
  }

  _dragControlPoint = (index: number) => (event: Leaflet.MouseEvent) => {
    Leaflet.DomEvent.stop(event)
    const {followRoad, updateModification} = this.props
    const coordinates = lonlat.toCoordinates(event.latlng)
    const segments = this._getSegments()
    const isEnd = index === segments.length
    const isStart = index === 0

    runAsync(async () => {
      if (!isStart) {
        const previousSegment = segments[index - 1]
        // will overwrite geometry and preserve other attributes
        segments[index - 1] = {
          ...previousSegment,
          geometry: await getLineString(coordinatesFromSegment(previousSegment), coordinates, {followRoad})
        }
      }

      if (!isEnd) {
        const nextSegment = segments[index]
        // can be a point if only one stop has been created
        const toCoordinates = coordinatesFromSegment(nextSegment, true)
        segments[index] = {
          ...nextSegment,
          geometry: await getLineString(coordinates, toCoordinates, {followRoad})
        }
      }

      updateModification({segments})
    })
  }

  _toggleControlPoint = (index: number) => () => {
    const segments = this._getSegments()
    if (index < segments.length) {
      segments[index] = {
        ...segments[index],
        stopAtStart: true
      }
    }

    if (index > 0) {
      segments[index - 1] = {
        ...segments[index - 1],
        stopAtEnd: true
      }
    }

    this.props.updateModification({segments})
  }

  /**
   * TODO Move to an action
   */
  _deleteStopOrPoint = (index: number) => () => {
    const {followRoad, updateModification} = this.props
    const segments = this._getSegments()

    if (index === 0) {
      updateModification({segments: segments.slice(1)})
    } else if (index === segments.length) {
      // nb stop index not hop index
      segments.pop()
      updateModification({segments})
    } else {
      // ok a little trickier
      const seg0 = segments[index - 1]
      const seg1 = segments[index]
      getLineString(
        coordinatesFromSegment(seg0),
        coordinatesFromSegment(seg1, true),
        {followRoad}
      ).then(line => {
        segments.splice(index - 1, 2, {
          fromStopId: seg0.fromStopId,
          geometry: line,
          spacing: seg0.spacing,
          stopAtEnd: seg1.stopAtEnd,
          stopAtStart: seg0.stopAtStart,
          toStopId: seg1.toStopId
        })
        updateModification({segments})
      })
    }
  }

  _clickSegment = (index: number) => (event: Leaflet.MouseEvent) => {
    Leaflet.DomEvent.stop(event)
    this._insertStop(event.latlng, index)
  }

  /**
   * Insert a stop at the specified position. TODO should be done in actions.
   */
  async _insertStop (coordinates: LonLatC, index: number) {
    const {followRoad, updateModification} = this.props
    let segments = this._getSegments()

    const snapStop = this._getStopNear(coordinates)
    let stopId
    if (snapStop) {
      coordinates = [snapStop.stop_lon, snapStop.stop_lat]
      stopId = snapStop.stop_id
    }

    const sourceSegment = segments[index]
    const line0 = await getLineString(coordinatesFromSegment(sourceSegment), coordinates, {followRoad})
    const line1 = await getLineString(coordinates, coordinatesFromSegment(sourceSegment, true), {followRoad})

    segments = [
      ...segments.slice(0, index), {
        fromStopId: sourceSegment.fromStopId,
        geometry: line0,
        spacing: sourceSegment.spacing,
        stopAtEnd: true,
        stopAtStart: sourceSegment.stopAtStart,
        toStopId: stopId
      }, {
        fromStopId: stopId,
        geometry: line1,
        spacing: sourceSegment.spacing,
        stopAtEnd: sourceSegment.stopAtEnd,
        stopAtStart: true,
        toStopId: sourceSegment.toStopId
      },
      ...segments.slice(index + 1)
    ]

    updateModification({segments})
  }
}

/**
 * Scope stops with their feed ID so that we can snap new patterns to stops from
 * multiple feeds.
 */
function getStateFromProps ({feeds, modification}) {
  const gtfsStops = [].concat(
    ...feeds.map(feed =>
      feed.stops.map(gtfsStop => ({
        stop_id: `${feed.id}:${gtfsStop.stop_id}`,
        stop_lat: gtfsStop.stop_lat,
        stop_lon: gtfsStop.stop_lon,
        stop_name: gtfsStop.stop_name
      }))
    )
  )

  const segments = modification.segments || []

  return {
    controlPoints: getControlPointsForSegments(segments),
    gtfsStops,
    mouseOverLineString: null,
    segmentFeatures: segments
      .filter(segment => segment.geometry.type !== 'Point') // if there's just a single stop, don't render an additional marker
      .map(segment => segment.geometry.coordinates.map(c => lonlat.toLeaflet(c))),
    stops: getStopsFromSegments(segments)
  }
}

function getControlPointsForSegments (segments) {
  const controlPoints = []
  for (let i = 0; i < segments.length; i++) {
    if (!segments[i].stopAtStart) {
      controlPoints.push({
        position: lonlat(coordinatesFromSegment(segments[i])),
        index: i
      })
    }

    if (i === segments.length - 1 && !segments[i].stopAtEnd) {
      controlPoints.push({
        position: lonlat(coordinatesFromSegment(segments[i], true)),
        index: i + 1
      })
    }
  }
  return controlPoints
}
