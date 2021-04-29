import {Button, Stack, useColorModeValue} from '@chakra-ui/react'
import {Map} from 'leaflet'
import set from 'lodash/set'
import dynamic from 'next/dynamic'
import {useEffect, useRef, useState} from 'react'
import {
  AttributionControl,
  Map as ReactMap,
  Viewport,
  useLeaflet
} from 'react-leaflet'
import {useSelector} from 'react-redux'
import MapControl from 'react-leaflet-control'

import useRouteChanging from 'lib/hooks/use-route-changing'
import selectModificationSaveInProgress from 'lib/selectors/modification-save-in-progress'
import {getParsedItem, stringifyAndSet} from 'lib/utils/local-storage'
import {toLatLngBounds} from 'lib/utils/bounds'

import Geocoder from './geocoder'
import {AddIcon, MinusIcon} from '../icons'

import 'leaflet/dist/leaflet.css'
import useCurrentRegion from 'lib/hooks/use-current-region'

const MapboxGLLayer = dynamic(() => import('./mapbox-gl'))

const VIEWPORT_KEY = 'analysis-map-viewport'
const ZOOM = 12
const MIN_ZOOM = 3 // Odd map shifts happen at lower zoom levels
const DEFAULT_VIEWPORT: Viewport = {
  center: [38, -77],
  zoom: ZOOM
}

const lightStyle =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE ?? 'conveyal/cjwu7oipd0bf41cqqv15huoim'
const darkStyle = 'conveyal/cklwkj6g529qi17nydq56jn9k'
const getStyle = (style: string) => `mapbox://styles/${style}`

type MapProps = {
  children?: React.ReactNode
  setLeafletContext: ({
    map,
    layerContainer
  }: {
    map: Map
    layerContainer: Map
  }) => void
}

function Controls({isDisabled}) {
  const {map} = useLeaflet()

  return (
    <MapControl position='topright'>
      <Stack>
        <Stack spacing={0}>
          <Button
            colorScheme='blue'
            isDisabled={isDisabled}
            onClick={() => map.zoomIn()}
            roundedBottom={0}
            shadow='lg'
          >
            <AddIcon />
          </Button>
          <Button
            colorScheme='blue'
            isDisabled={isDisabled}
            onClick={() => map.zoomOut()}
            roundedTop={0}
            shadow='lg'
          >
            <MinusIcon />
          </Button>
        </Stack>
        <Geocoder isDisabled={isDisabled} />
      </Stack>
    </MapControl>
  )
}

export default function BaseMap({children, setLeafletContext}: MapProps) {
  const style = useColorModeValue(lightStyle, darkStyle)
  const backgroundColor = useColorModeValue('gray.50', 'gray.800')
  const leafletMapRef = useRef<ReactMap>()
  const region = useCurrentRegion()
  const [viewport, setViewport] = useState<Viewport>(() => ({
    ...DEFAULT_VIEWPORT,
    ...getParsedItem(VIEWPORT_KEY)
  }))
  const saveInProgress = useSelector(selectModificationSaveInProgress)
  const [routeChanging] = useRouteChanging()

  // On mount, store the leaflet element
  useEffect(() => {
    const map = leafletMapRef.current?.leafletElement
    if (map) {
      // Attach the leaflet map to `window` if it exists. Helpful with Cypress test
      set(window, 'LeafletMap', map)
      // Store the leaflet context for consuming elsewhere
      setLeafletContext({map, layerContainer: map})
    }
  }, [leafletMapRef, setLeafletContext])

  // Map container map change sizes between pages
  useEffect(() => {
    const map = leafletMapRef.current?.leafletElement
    if (map && !routeChanging) {
      map.invalidateSize()

      // Delay an additional inalidation to allow for elements to change the
      // viewport size. This is hacky, but we don't currently have an application
      // state to indicate that all elements have been drawn.
      const id = setTimeout(() => {
        map.invalidateSize()
      }, 100)
      return () => clearTimeout(id)
    }
  }, [routeChanging, leafletMapRef])

  // If center is not within region bounds, reset to center
  useEffect(() => {
    if (region) {
      const regionBounds = toLatLngBounds(region.bounds)
      const center = viewport?.center
      const regionCenter = regionBounds.getCenter()
      if (!center || !regionBounds.contains(center)) {
        setViewport({
          center: [regionCenter.lat, regionCenter.lng],
          zoom: ZOOM
        })
      }
    }
  }, [leafletMapRef, region, viewport])

  return (
    <ReactMap
      attributionControl={false}
      className={
        routeChanging || saveInProgress
          ? 'disableAndDim'
          : 'conveyal-leaflet-map'
      }
      minZoom={MIN_ZOOM}
      onViewportChanged={(v) => stringifyAndSet(VIEWPORT_KEY, v)}
      preferCanvas={true}
      ref={leafletMapRef}
      style={{backgroundColor}}
      tap={false}
      viewport={viewport || DEFAULT_VIEWPORT}
      zoomControl={false}
    >
      {process.env.NEXT_PUBLIC_BASEMAP_DISABLED !== 'true' && (
        <MapboxGLLayer style={getStyle(style)} />
      )}

      <AttributionControl position='bottomright' prefix={false} />

      <Controls isDisabled={routeChanging || saveInProgress} />

      {!routeChanging && children ? children : null}
    </ReactMap>
  )
}
