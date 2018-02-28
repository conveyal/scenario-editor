// @flow
import lonlat from '@conveyal/lonlat'
import {lineString, point as createPoint} from '@turf/helpers'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import pointToLineDistance from '@turf/point-to-line-distance'
import Leaflet from 'leaflet'
import React from 'react'
import {FeatureGroup, GeoJSON} from 'react-leaflet'
import uuid from 'uuid'

import {MINIMUM_SNAP_STOP_ZOOM_LEVEL} from '../../../constants'

import getStopsFromSegments from '../../../utils/get-stops'
import getNearestStopToPoint from '../../../utils/get-stop-near-point'
import getLineString from '../../../utils/get-line-string'
import AutoCreatedStopMarker from './auto-created-stop-marker'
import ControlPointMarker from './control-point-marker'
import GTFSStopGridLayer from './gtfs-stop-gridlayer'
import StopMarker from './stop-marker'

import type {Feed, LonLatC, Modification} from '../../../types'

const SNAP_TO_SEGMENT_DISTANCE_KM = 0.02 // 20m

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

export default class TransitEditor extends FeatureGroup {
  props: Props

  state = getStateFromProps(this.props)

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
  }

  render () {
    // this should get cleared on each render
    this.draggingSegment = -1
    const {
      controlPoints,
      gtfsStops,
      mouseOverLineString,
      segmentFeatures,
      stops
    } = this.state

    return (
      <g>
        <GTFSStopGridLayer stops={gtfsStops} />
        {segmentFeatures
          .map((feature, index) => (
            <GeoJSON
              data={feature}
              key={feature.properties.key}
            />
          ))}
        {stops.filter(s => s.autoCreated).map((stop, i) =>
          <AutoCreatedStopMarker
            key={`auto-created-stop-${i}-${lonlat.toString(stop)}`}
            onClick={this._dragAutoCreatedStop(stop.index)}
            onDragend={this._dragAutoCreatedStop(stop.index)}
            position={stop}
            />)}
        {controlPoints.map(controlPoint =>
          <ControlPointMarker
            key={`control-point-${controlPoint.index}-${lonlat.toString(controlPoint.position)}`}
            onDelete={this._deleteStopOrPoint(controlPoint.index)}
            onDragend={this._dragControlPoint(controlPoint.index)}
            onToggle={this._toggleControlPoint(controlPoint.index)}
            position={controlPoint.position}
          />)}
        {stops.filter(s => !s.autoCreated).map(stop =>
          <StopMarker
            key={`stop-${stop.index}-${lonlat.toString(stop)}`}
            onDelete={this._deleteStopOrPoint(stop.index)}
            onDragend={this._dragStop(stop.index)}
            onToggle={this._toggleStop(stop.index)}
            position={stop}
            snapped={!!stop.stopId}
            />)}
        {mouseOverLineString &&
          <GeoJSON
            data={mouseOverLineString}
            key={mouseOverLineString.properties.key}
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
    Leaflet.DomEvent.stop(event)
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
          const {segmentFeatures} = this.state
          if (segmentFeatures.length > 0) {
            let closestSegmentDistance = Infinity
            let closestSegmentIndex = -1
            const point = createPoint(coordinates)
            for (let i = 0; i < segmentFeatures.length; i++) {
              const distance = pointToLineDistance(
                point,
                segmentFeatures[i]
              )
              if (distance < closestSegmentDistance) {
                closestSegmentIndex = i
                closestSegmentDistance = distance
              }
            }

            if (closestSegmentDistance < SNAP_TO_SEGMENT_DISTANCE_KM) {
              return this._insertStop(
                nearestPointOnLine(segmentFeatures[closestSegmentIndex], point).geometry.coordinates,
                closestSegmentIndex
              )
            }
          }

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
        start = coordinatesFromSegment(segments.slice(-1)[0], true)
        end = lonlat.toCoordinates(event.latlng)
      } else {
        start = lonlat.toCoordinates(event.latlng)
        end = coordinatesFromSegment(segments[0], false)
      }

      this.setState({
        mouseOverLineString: {
          type: 'Feature',
          properties: {
            key: uuid.v4()
          },
          geometry: lineString([start, end]).geometry
        }
      })

      if (followRoad) {
        // TODO debounce the follow road function so it only runs when you stop moving the mouse for a few seconds
      }
    }
  }

  _dragAutoCreatedStop = (index: number) => (event: Leaflet.MapEvent) => {
    Leaflet.DomEvent.stop(event)
    this._insertStop(lonlat.toCoordinates(event.target.getLatLng()), index)
  }

  _dragStop = (index: number) => (event: Leaflet.MapEvent) => {
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

  _dragControlPoint = (index: number) => (event: Leaflet.MapEvent) => {
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
      .map(segment => ({
        type: 'Feature',
        properties: {
          key: uuid.v4() // GeoJSON layers don't update on props change, so use a UUID as key to force replacement on redraw
        },
        geometry: segment.geometry
      })),
    stops: getStopsFromSegments(segments)
  }
}

const getControlPointsForSegments = (segments) => segments
  .map((segment, index) => ({...segment, index}))
  .filter((segment, i) => !segment.stopAtStart || (!segment.stopAtEnd && i === segments.length - 1))
  .map(segment => ({
    position: lonlat(coordinatesFromSegment(segment)),
    index: segment.index
  }))
