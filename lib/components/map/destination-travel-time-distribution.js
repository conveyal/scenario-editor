// @flow
/**
 * Show a popup with the travel time distribution from the origin to a location
 * @author mattwigway
 */

import lonlat, {toLeaflet} from '@conveyal/lonlat'
import {scaleLinear} from 'd3-scale'
import React from 'react'
import {Marker, Popup} from 'react-leaflet'
import {Icon, Marker as LeafletMarker} from 'leaflet'

import Boxplot from '../analysis/boxplot'
import MinuteTicks from '../analysis/minute-ticks'
import {SCENARIO_PERCENTILE_COLOR, COMPARISON_PERCENTILE_COLOR, STALE_PERCENTILE_COLOR} from '../../constants/colors'
import DeepEqualComponent from '../deep-equal'
import messages from '../../utils/messages'

import type {LonLat, Quintiles} from '../../types'

const WIDTH = 450
const HEIGHT = 100
const LEGEND_HEIGHT = 0.2
const MAX_TRIP_DURATION = 120
const SCALE = scaleLinear()
  .domain([0, MAX_TRIP_DURATION])
  .range([0, WIDTH])
const FONT_SIZE = 10

// a completely transparent, 1x1 pixel png, used to hide the marker
const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QYNESIQywfQ+QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAC0lEQVQI12NgAAIAAAUAAeImBZsAAAAASUVORK5CYII='

type Props = {
  destination: LonLat,
  destinationTravelTimeDistribution: Quintiles,
  comparisonDestinationTravelTimeDistribution: ?Quintiles,
  isFetchingIsochrone: boolean,
  remove(): void,
  setDestination (LonLat): void
}

export default class DestinationTravelTimeDistribution extends DeepEqualComponent<void, Props, void> {
  // not using state so we can guarantee synchronous updates
  draggingMarker = false

  render () {
    const {destination, destinationTravelTimeDistribution, comparisonDestinationTravelTimeDistribution, isFetchingIsochrone} = this.props
    if (!destination) return null

    // if comparison we are showing two side-by-side boxplots
    let boxplotHeight = HEIGHT * (1 - LEGEND_HEIGHT)
    if (comparisonDestinationTravelTimeDistribution) boxplotHeight /= 2

    // TODO probably shouldn't have a span here but markers inside a feature group don't show
    // popups
    return <span>
      <Marker
        position={toLeaflet(destination)}
        draggable
        onDrag={this.drag} />
      <DefaultOpenMarker
        position={toLeaflet(destination)}
        onPopupClose={this.remove}
        icon={new Icon({iconUrl: TRANSPARENT_PNG, iconSize: 1, popupAnchor: [0, -48]})}
        >
        <Popup maxWidth={WIDTH + 10}>
          <figure>
            <figcaption>{messages.analysis.travelTime}</figcaption>
            <svg width={WIDTH} height={HEIGHT} style={{fontSize: FONT_SIZE}}>
              <g transform={`translate(0 ${HEIGHT})`}>
                <MinuteTicks scale={SCALE} textHeight={FONT_SIZE} />
              </g>
              {/* CSS transforms are evaluated right to left
                first rotate ccw so that the boxplot is horizontal
                it will then be sitting "on top" of the svg because the default rotation origin is
                0, 0 - the top left of the svg. Translate it down (positive y) to compensate.
                 */}
              <g transform={`translate(0 ${boxplotHeight}) rotate(-90)`}>
                <Boxplot
                  width={boxplotHeight}
                  scale={SCALE}
                  {...destinationTravelTimeDistribution}
                  color={isFetchingIsochrone ? STALE_PERCENTILE_COLOR : SCENARIO_PERCENTILE_COLOR}
                />
              </g>

              {comparisonDestinationTravelTimeDistribution &&
                <g transform={`translate(0 ${boxplotHeight * 2}) rotate(-90)`}>
                  <Boxplot
                    width={boxplotHeight}
                    scale={SCALE}
                    {...comparisonDestinationTravelTimeDistribution}
                    color={isFetchingIsochrone ? STALE_PERCENTILE_COLOR : COMPARISON_PERCENTILE_COLOR}
                  />
                </g>}
            </svg>
          </figure>
        </Popup>
      </DefaultOpenMarker>
    </span>
  }

  remove = () => {
    // yuck, if we remove at the same time the popupclosed event is fired, we get an error
    // because leaflet and react are both changing the dom simulataneously. Set a timeout on removing
    // the component so that leaflet can get out of the way. Otherwise, react explodes when you try
    // to open this component again.
    setTimeout(this.props.remove, 50)
  }

  drag = (e: Event & {target: LeafletMarker}): void => {
    this.props.setDestination(lonlat(e.target.getLatLng()))
  }
}

// https://stackoverflow.com/questions/38730152
class DefaultOpenMarker extends Marker {
  componentDidMount () {
    super.componentDidMount()
    this.leafletElement.openPopup()
  }
}
