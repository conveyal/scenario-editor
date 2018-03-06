// @flow
import lonlat from '@conveyal/lonlat'
import message from '@conveyal/woonerf/message'
import Leaflet from 'leaflet'
import React from 'react'
import {
  LayerGroup,
  Marker,
  Polyline,
  Popup
} from 'react-leaflet'

import {MINIMUM_SNAP_STOP_ZOOM_LEVEL} from '../../../constants'
import colors from '../../../constants/colors'

import {Button} from '../../buttons'
import {
  getControlPointIconForZoom,
  getNewStopIconForZoom,
  getSnappedStopIconForZoom
} from '../../map/circle-icons'
import getStopsFromSegments from '../../../utils/get-stops'
import getNearestStopToPoint from '../../../utils/get-stop-near-point'
import getLineString from '../../../utils/get-line-string'
import createLogDomEvent from '../../../utils/log-dom-event'
import GTFSStopGridLayer from './gtfs-stop-gridlayer'

import type {Feed, LonLatC, Modification} from '../../../types'

const logDomEvent = createLogDomEvent('transit-editor')

// Wrapper to use `async`/`await` functions that can't be passed as event handlers
const runAsync = (as) => as().catch(e => { console.error(e); throw e })

// Helper function to get the coordinates from a segment depending on type
const coordinatesFromSegment = (segment, end = false) => segment.geometry.type === 'Point'
  ? segment.geometry.coordinates
  : end ? segment.geometry.coordinates.slice(-1)[0] : segment.geometry.coordinates[0]

const getLineWeightForZoom = (z: number) => z < 11 ? 1 : z - 10

type Props = {
  allowExtend: boolean,
  extendFromEnd: boolean,
  feeds: Feed[],
  followRoad: boolean,
  modification: Modification,
  spacing: number,
  updateModification: (any) => void
}

export default class TransitEditor extends LayerGroup {
  props: Props

  state = {
    ...getStateFromProps(this.props),
    controlPointIcon: getControlPointIconForZoom(this.context.map.getZoom()),
    lineWeight: getLineWeightForZoom(this.context.map.getZoom()),
    newStopIcon: getNewStopIconForZoom(this.context.map.getZoom()),
    newSnappedStopIcon: getSnappedStopIconForZoom(this.context.map.getZoom())
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
    map.on('mousemove', this._handleMouseMove)
    map.on('zoomend', this._handleZoomEnd)

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
    map.off('mousemove', this._handleMouseMove)
    map.off('zoomend', this._handleZoomEnd)
  }

  _handleZoomEnd = () => {
    const z = this.context.map.getZoom()
    this.setState({
      controlPointIcon: getControlPointIconForZoom(z),
      lineWeight: getLineWeightForZoom(z),
      newStopIcon: getNewStopIconForZoom(z),
      newSnappedStopIcon: getSnappedStopIconForZoom(z)
    })
  }

  render () {
    const {
      controlPointIcon,
      controlPoints,
      cursorPosition,
      gtfsStops,
      lineWeight,
      mouseOverLineString,
      newStopIcon,
      newSnappedStopIcon,
      segmentFeatures,
      showStop,
      stops
    } = this.state
    const zoom = this.context.map.getZoom()
    return (
      <g>
        {mouseOverLineString &&
          <Polyline
            positions={mouseOverLineString}
            weight={lineWeight}
          />}
        <GTFSStopGridLayer stops={gtfsStops} />
        {segmentFeatures
          .map((feature, index) => (
            <Polyline
              color={colors.ADDED}
              key={`segment-${index}`}
              onClick={this._clickSegment(index)}
              onBlur={this._handleMouseOutSegment}
              onFocus={this._handleMouseOverSegment}
              onMouseover={this._handleMouseOverSegment}
              onMouseout={this._handleMouseOutSegment}
              positions={feature}
              weight={lineWeight}
            />
          ))}
        {stops.filter(s => s.autoCreated).map((stop, i) =>
          <Marker
            position={stop}
            draggable
            icon={newStopIcon}
            key={`auto-created-stop-${i}-${lonlat.toString(stop)}`}
            onClick={this._dragAutoCreatedStop(stop.index)}
            onDragend={this._dragAutoCreatedStop(stop.index)}
            opacity={0.5}
            zIndexOffset={500}
          />)}
        {controlPoints.map(controlPoint =>
          <Marker
            position={controlPoint.position}
            draggable
            icon={controlPointIcon}
            key={`control-point-${controlPoint.index}-${lonlat.toString(controlPoint.position)}-${zoom}`}
            onDragend={this._dragControlPoint(controlPoint.index)}
            zIndexOffset={750}
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
          </Marker>)}
        {stops.filter(s => !s.autoCreated).map(stop =>
          <Marker
            position={stop}
            icon={stop.stopId ? newSnappedStopIcon : newStopIcon}
            draggable
            key={`stop-${stop.index}-${lonlat.toString(stop)}`}
            onDragend={this._dragStop(stop.index)}
            zIndexOffset={1000}
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
          </Marker>)}
        {showStop &&
          <Marker
            position={cursorPosition}
            icon={newStopIcon}
            interactive={false}
          />}
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
    logDomEvent('_handleMapClick', event)
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

  _handleMouseMove = (event: Leaflet.MouseEvent) => {
    logDomEvent('_handleMouseMove', event)
    this.setState({cursorPosition: event.latlng})
  }

  _handleMouseOverSegment = (event: Leaflet.MouseEvent) => {
    logDomEvent('_handleMouseOverSegment', event)
    this.setState({showStop: true})
  }

  _handleMouseOutSegment = (event: Leaflet.MouseEvent) => {
    logDomEvent('_handleMouseOutSegment', event)
    this.setState({showStop: false})
  }

  _dragAutoCreatedStop = (index: number) => (event: Leaflet.MouseEvent) => {
    logDomEvent('_dragAutoCreatedStop', event)
    Leaflet.DomEvent.stop(event)
    this._insertStop(lonlat.toCoordinates(event.target.getLatLng()), index)
  }

  _dragStop = (index: number) => (event: Leaflet.MouseEvent) => {
    logDomEvent('_dragStop', event)
    Leaflet.DomEvent.stop(event)
    const {followRoad, updateModification} = this.props
    const segments = this._getSegments()
    const position = event.target.getLatLng()
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
    logDomEvent('_dragControlPoint', event)
    Leaflet.DomEvent.stop(event)
    const {followRoad, updateModification} = this.props
    const coordinates = lonlat.toCoordinates(event.target.getLatLng())
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
    logDomEvent('_clickSegment', event)
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
function getStateFromProps ({extendFromEnd, feeds, modification}) {
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
    previousCoordinates: segments.length > 0 && lonlat.toLeaflet(extendFromEnd
      ? coordinatesFromSegment(segments.slice(-1)[0], true)
      : lonlat.toLeaflet(coordinatesFromSegment(segments[0], false))),
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
