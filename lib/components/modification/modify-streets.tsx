import L from 'leaflet'
import {useRef, MutableRefObject, useEffect, useCallback} from 'react'
import {FeatureGroup} from 'react-leaflet'

import type {FeatureCollection, Polygon} from 'geojson'

import {EditControl} from 'lib/components/map/leaflet-draw'
import colors from 'lib/constants/colors'

import StreetForm from './street-form'

const drawSettings = {
  polyline: false,
  polygon: {
    shapeOptions: {
      color: colors.MODIFIED
    }
  },
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
export default function ModifyStreets({modification, update}) {
  const featureGroupRef: MutableRefObject<FeatureGroup> = useRef()

  // Add the existing layers to the map on initial load
  useEffect(() => {
    if (featureGroupRef.current) {
      modification.polygons.forEach((coordinates) => {
        const layer = new L.GeoJSON(
          L.GeoJSON.asFeature({
            type: 'Polygon',
            coordinates: [coordinates] // polygons allow holes
          }),
          {
            style: {
              color: colors.MODIFIED
            }
          }
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
        const polygons = featureCollection.features
          .filter((feature) => {
            if (feature.geometry.type === 'Polygon') {
              const coordinates = feature.geometry.coordinates || []
              return coordinates.length > 0 && coordinates[0].length > 1
            }
          })
          .map((feature) => (feature.geometry as Polygon).coordinates[0]) // holes are not allowed?
        update({polygons})
      }
    }
  }, [featureGroupRef, update])

  return (
    <>
      <FeatureGroup ref={featureGroupRef}>
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
