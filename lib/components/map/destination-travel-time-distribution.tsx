import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Stack,
  Text
} from '@chakra-ui/core'
import lonlat from '@conveyal/lonlat'
import fpGet from 'lodash/fp/get'
import {scaleLinear} from 'd3-scale'
import {useState, useEffect, useReducer, useRef} from 'react'
import {useSelector} from 'react-redux'
import {CircleMarker, useLeaflet} from 'react-leaflet'
import MapControl from 'react-leaflet-control'

import colors from 'lib/constants/colors'
import nearestPercentileIndex from 'lib/selectors/nearest-percentile-index'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'

import Boxplot from '../analysis/boxplot'
import MinuteTicks from '../analysis/minute-ticks'

const WIDTH = 300
const HEIGHT = 15
const MAX_TRIP_DURATION = 120
const SCALE = scaleLinear().domain([0, MAX_TRIP_DURATION]).range([0, WIDTH])
const FONT_SIZE = 10
const STROKE_WIDTH = 1

function createDistribution(latlng, travelTimeSurface) {
  const pixel = lonlat.toPixel(
    lonlat.fromLeaflet(latlng),
    travelTimeSurface.zoom
  )
  // floor them to get top left of cell the point is a part of (TODO correct?)
  const x = Math.floor(pixel.x - travelTimeSurface.west)
  const y = Math.floor(pixel.y - travelTimeSurface.north)

  if (
    travelTimeSurface.contains(x, y, 0) &&
    travelTimeSurface.contains(x, y, 1) &&
    travelTimeSurface.contains(x, y, 2) &&
    travelTimeSurface.contains(x, y, 3) &&
    travelTimeSurface.contains(x, y, 4)
  ) {
    return [
      travelTimeSurface.get(x, y, 0),
      travelTimeSurface.get(x, y, 1),
      travelTimeSurface.get(x, y, 2),
      travelTimeSurface.get(x, y, 3),
      travelTimeSurface.get(x, y, 4)
    ]
  } else {
    return null
  }
}

// Select surfaces
const selectSurface = fpGet('analysis.travelTimeSurface')
const selectComparisonSurface = fpGet('analysis.comparisonTravelTimeSurface')

function reducer(state, action) {
  switch (action.type) {
    case 'toggle lock':
      return {locked: !state.locked, latlng: action.payload}
    case 'move':
      if (state.locked) return state
      return {...state, latlng: action.payload}
  }
}

const initialState = {
  latlng: null,
  locked: false
}

// Grids contain high values for inaccessible locations
const isValidTime = (m) => m >= 0 && m <= 120

/**
 * Show a popup with the travel time distribution from the origin to a location
 * @author mattwigway
 */
export default function DestinationTravelTimeDistribution() {
  const markerRef = useRef<CircleMarker>()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [distribution, setDistribution] = useState<void | number[]>()
  const [comparisonDistribution, setComparisonDistribution] = useState<
    void | number[]
  >()
  const surface = useSelector(selectSurface)
  const comparisonSurface = useSelector(selectComparisonSurface)
  const leaflet = useLeaflet()
  const percentileIndex = nearestPercentileIndex(
    useSelector(selectTravelTimePercentile)
  )
  const {latlng} = state

  // Bring the marker to the front on each render.
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.leafletElement.bringToFront()
    }
  })

  // Calculate the distributions when the destination or surface changes
  useEffect(() => {
    if (latlng && surface) {
      setDistribution(createDistribution(latlng, surface))
    } else {
      setDistribution(null)
    }
  }, [latlng, surface])
  useEffect(() => {
    if (latlng && comparisonSurface) {
      setComparisonDistribution(createDistribution(latlng, comparisonSurface))
    } else {
      setComparisonDistribution(null)
    }
  }, [latlng, comparisonSurface])

  // Set the destination on mouse move
  useEffect(() => {
    function onMove(e) {
      dispatch({
        type: 'move',
        payload: e.latlng
      })
    }
    leaflet.map.on('mousemove', onMove)
    return () => {
      leaflet.map.off('mousemove', onMove)
    }
  }, [dispatch, leaflet])

  const fullHeight = (comparisonDistribution ? HEIGHT * 2 : HEIGHT) + FONT_SIZE

  return (
    <>
      {latlng && (
        <CircleMarker
          center={latlng}
          color={state.locked ? '#333' : '#3182ce'}
          onclick={(e) => dispatch({type: 'toggle lock', payload: e.latlng})}
          radius={5}
          ref={markerRef}
        />
      )}
      <MapControl position='bottomleft'>
        <Stack backgroundColor='white' boxShadow='lg' rounded='md' pt={2}>
          <Flex alignItems='baseline' justify='space-between' px={3}>
            <Heading size='sm'>Travel time distribution (minutes)</Heading>
            {latlng && distribution && (
              <Text fontFamily='mono' fontSize='sm'>
                {latlng.lng.toFixed(3)}, {latlng.lat.toFixed(3)}
              </Text>
            )}
          </Flex>
          {distribution && (
            <Box fontFamily='mono' px={3} pb={2} position='relative'>
              {isValidTime(distribution[percentileIndex]) && (
                <Text
                  color='blue.500'
                  fontSize={FONT_SIZE}
                  fontWeight='bolder'
                  position='absolute'
                >
                  {distribution[percentileIndex]}
                </Text>
              )}
              {comparisonDistribution &&
                isValidTime(comparisonDistribution[percentileIndex]) && (
                  <Text
                    color='red.500'
                    fontSize={FONT_SIZE}
                    fontWeight='bolder'
                    position='absolute'
                    top={HEIGHT + 'px'}
                  >
                    {comparisonDistribution[percentileIndex]}
                  </Text>
                )}
              <figure>
                <svg
                  width={WIDTH}
                  height={fullHeight}
                  style={{fontSize: FONT_SIZE}}
                >
                  <g transform={`translate(0 ${fullHeight})`}>
                    <MinuteTicks
                      label={false}
                      textHeight={FONT_SIZE}
                      scale={SCALE}
                    />
                  </g>

                  <g transform={`translate(0 ${HEIGHT}) rotate(-90)`}>
                    <Boxplot
                      color={colors.PROJECT_PERCENTILE_COLOR}
                      positions={distribution}
                      scale={SCALE}
                      strokeWidth={STROKE_WIDTH}
                      width={HEIGHT}
                    />
                  </g>

                  {comparisonDistribution && (
                    <g transform={`translate(0 ${HEIGHT * 2}) rotate(-90)`}>
                      <Boxplot
                        color={colors.COMPARISON_PERCENTILE_COLOR}
                        positions={comparisonDistribution}
                        scale={SCALE}
                        strokeWidth={STROKE_WIDTH}
                        width={HEIGHT}
                      />
                    </g>
                  )}
                </svg>
              </figure>
            </Box>
          )}

          {surface && !distribution && (
            <Alert status='info'>
              <AlertIcon /> Mouse over the isochrone to show travel times.
            </Alert>
          )}
        </Stack>
      </MapControl>
    </>
  )
}
