import L from 'leaflet'
import {useCallback, useEffect, useRef, MutableRefObject} from 'react'
import {FeatureGroup} from 'react-leaflet'

import type {FeatureCollection, LineString} from 'geojson'

import {EditControl} from 'lib/components/map/leaflet-draw'

import StreetForm from './street-form'

const drawSettings = {
  polyline: true,
  polygon: false,
  rectangle: false,
  circle: false,
  marker: false,
  circlemarker: false
}

// Check if the value is a feature collection
const isFeatureCollection = (fc: any): fc is FeatureCollection =>
  (fc as FeatureCollection).features !== undefined

/**
 * Must be rendered in a MapLayout
 */
export default function AddStreets({modification, update}) {
  const featureGroupRef: MutableRefObject<FeatureGroup> = useRef()

  // Add the existing layers to the map on initial load
  useEffect(() => {
    if (featureGroupRef.current) {
      modification.lineStrings.forEach((coordinates) => {
        const layer = new L.GeoJSON(
          L.GeoJSON.asFeature({
            type: 'LineString',
            coordinates
          })
        )
        layer.eachLayer((l) =>
          featureGroupRef.current.leafletElement.addLayer(l)
        )
      })
    }
  }, [featureGroupRef]) // eslint-disable-line

  // Handle create, delete, and edit
  const onGeometryChange = useCallback(() => {
    if (featureGroupRef.current) {
      const featureCollection = featureGroupRef.current.leafletElement.toGeoJSON()
      if (isFeatureCollection(featureCollection)) {
        const lineStrings = featureCollection.features
          .filter((feature) => {
            if (feature.geometry.type === 'LineString') {
              return (feature.geometry.coordinates || []).length > 1
            }
            return false
          })
          .map((feature) => (feature.geometry as LineString).coordinates)
        update({lineStrings})
      }
    }
  }, [featureGroupRef, update])

  return (
    <>
      <FeatureGroup key='add-streets-feature' ref={featureGroupRef}>
        <EditControl
          draw={drawSettings}
          position='topright'
          onCreated={onGeometryChange}
          onDeleted={onGeometryChange}
          onEdited={onGeometryChange}
        />
      </FeatureGroup>

      <StreetForm modification={modification} update={update} />
    </>
  )
}
