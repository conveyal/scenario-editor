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
import {LatLng, LeafletMouseEvent} from 'leaflet'
import {memo, useState, useEffect, useRef, useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {CircleMarker, useLeaflet} from 'react-leaflet'
import MapControl from 'react-leaflet-control'

import {updateRequestsSettings} from 'lib/actions/analysis/profile-request'
import colors from 'lib/constants/colors'
import nearestPercentileIndex from 'lib/selectors/nearest-percentile-index'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'

import Boxplot from '../analysis/boxplot'
import MinuteTicks from '../analysis/minute-ticks'
import Pane from '../map/pane'

const WIDTH = 300
const HEIGHT = 15
const MAX_TRIP_DURATION = 120
const SCALE = scaleLinear().domain([0, MAX_TRIP_DURATION]).range([0, WIDTH])
const PADDING = 4
const FONT_SIZE = 10
const STROKE_WIDTH = 1

function createDistribution(
  latlng: LatLng,
  travelTimeSurface: CL.AccessGrid
): null | number[] {
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

// Grids contain high values for inaccessible locations
const isValidTime = (m: number) => m >= 0 && m <= 120

/**
 * Show a popup with the travel time distribution from the origin to a location
 * @author mattwigway
 */
export default memo(function DestinationTravelTimeDistribution() {
  const markerRef = useRef<CircleMarker>()
  const dispatch = useDispatch()
  const [mouseLatLng, setMouseLatLng] = useState<LatLng | null>(null)
  const [lockedLatLng, setLockedLatLng] = useState<LatLng | false>(false)
  const [latlng, setLatLng] = useState<LatLng | null>(null)
  const [distribution, setDistribution] = useState<void | number[]>()
  const [comparisonDistribution, setComparisonDistribution] = useState<
    void | number[]
  >()
  const surface: CL.AccessGrid = useSelector(selectSurface)
  const comparisonSurface: CL.AccessGrid = useSelector(selectComparisonSurface)
  const leaflet = useLeaflet()
  const percentileIndex = nearestPercentileIndex(
    useSelector(selectTravelTimePercentile)
  )

  // Set the current latlng to use
  useEffect(() => {
    if (lockedLatLng) setLatLng(lockedLatLng)
    else if (mouseLatLng) setLatLng(mouseLatLng)
    else setLatLng(null)
  }, [mouseLatLng, lockedLatLng])

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
    function onMove(e: LeafletMouseEvent) {
      setMouseLatLng(e.latlng)
    }
    leaflet.map.on('mousemove', onMove)
    return () => {
      leaflet.map.off('mousemove', onMove)
    }
  }, [dispatch, leaflet])

  // Lock the marker and store toLat/toLon
  const lockMarker = useCallback(
    (e: LeafletMouseEvent) => {
      const {latlng} = e
      setLockedLatLng(latlng)
      dispatch(
        updateRequestsSettings({
          index: 0,
          params: {
            toLat: latlng.lat,
            toLon: latlng.lng
          }
        })
      )
    },
    [dispatch, setLockedLatLng]
  )

  const fullHeight =
    (comparisonDistribution ? HEIGHT * 2 : HEIGHT) + PADDING + FONT_SIZE

  return (
    <>
      {mouseLatLng && (
        <Pane zIndex={600}>
          {lockedLatLng !== false ? (
            <CircleMarker
              center={lockedLatLng}
              color='#333'
              onclick={() => setLockedLatLng(false)}
              radius={5}
            />
          ) : (
            <CircleMarker
              center={mouseLatLng}
              color='#3182ce'
              onclick={lockMarker}
              radius={5}
              ref={markerRef}
            />
          )}
        </Pane>
      )}
      <MapControl position='bottomleft'>
        <Stack backgroundColor='white' boxShadow='lg'>
          <Flex alignItems='baseline' justify='space-between' pt={3} px={3}>
            <Heading size='sm'>Travel time distribution (minutes)</Heading>
            {latlng && distribution && (
              <Text fontFamily='mono' fontSize='sm'>
                {latlng.lng.toFixed(3)}, {latlng.lat.toFixed(3)}
              </Text>
            )}
          </Flex>

          {surface && !distribution && (
            <Alert status='info'>
              <AlertIcon /> Mouse over the isochrone to show travel times.
            </Alert>
          )}

          {distribution && (
            <Box fontFamily='mono' position='relative' px={3} pb={3}>
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
        </Stack>
      </MapControl>
    </>
  )
})
