import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack
} from '@chakra-ui/react'
import distance from '@turf/distance'
import {useCallback, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import shp from 'shpjs'

import {createMultiple as createModifications} from 'lib/actions/modifications'
import useInput from 'lib/hooks/use-controlled-input'
import useFileInput from 'lib/hooks/use-file-input'
import useRouteTo from 'lib/hooks/use-route-to'
import logrocket from 'lib/logrocket'
import message from 'lib/message'
import {createAddTripPattern} from 'lib/utils/modification'
import {create as createTimetable} from 'lib/utils/timetable'

import NumberInput from './number-input'
import FileSizeInputHelper from './file-size-input-helper'

const hasOwnProperty = (o, p) => Object.prototype.hasOwnProperty.call(o, p)

/**
 * Make LineStrings look like MultiLineStrings.
 */
function getCoordinatesFromFeature(
  feature: GeoJSON.Feature
): GeoJSON.Position[][] {
  if (feature.geometry.type === 'LineString') {
    return [(feature.geometry as GeoJSON.LineString).coordinates]
  } else if (feature.geometry.type === 'MultiLineString') {
    const coords = (feature.geometry as GeoJSON.MultiLineString).coordinates
    for (let i = 1; i < coords.length; i++) {
      // Ensure MultiLineStrings line up at the ends.
      if (distance(coords[i - 1].slice(-1)[0], coords[i][0]) > 0.05) {
        throw new Error(message('shapefile.invalidMultiLineString'))
      }
    }
    return coords
  } else {
    throw new Error(message('shapefile.invalidShapefileType'))
  }
}

/**
 * Import a shapefile. This more or less does what geom2gtfs used to.
 */
export default function ImportShapefile({projectId, regionId, variants}) {
  const dispatch = useDispatch()
  const [
    shapefile,
    setShapefile
  ] = useState<void | shp.FeatureCollectionWithFilename>()
  const [stopSpacingMeters, setStopSpacingMeters] = useState(400)
  const [bidirectional, setBidirectional] = useState(true)
  const [autoCreateStops, setAutoCreateStops] = useState(true)
  const nameInput = useInput({value: ''})
  const freqInput = useInput({value: ''})
  const speedInput = useInput({value: ''})
  const [error, setError] = useState<void | string>()
  const [properties, setProperties] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const file = useFileInput()

  const routeToModifications = useRouteTo('modifications', {
    projectId,
    regionId
  })

  const readShapeFile = useCallback(
    async (e: ProgressEvent<FileReader>) => {
      if (e.target.result instanceof ArrayBuffer) {
        const shapefiles = await shp.parseZip(e.target.result)
        const properties = []

        // For TypeScript
        const shapefile: shp.FeatureCollectionWithFilename = Array.isArray(
          shapefiles
        )
          ? shapefiles[0]
          : shapefiles

        for (const key in shapefile.features[0].properties) {
          if (hasOwnProperty(shapefile.features[0].properties, key)) {
            properties.push(key)
          }
        }

        setShapefile(shapefile)
        setProperties(properties)
        nameInput.onChange(properties[0])
        freqInput.onChange(properties[0])
        speedInput.onChange(properties[0])
        setError()
      }
    },
    [freqInput, nameInput, speedInput]
  )

  useEffect(() => {
    if (file.files && file.files[0]) {
      const reader = new window.FileReader()
      reader.onloadend = readShapeFile
      reader.readAsArrayBuffer(file.files[0])
    }
  }, [file, readShapeFile])

  /** create and save modifications for each line */
  async function create() {
    setUploading(true)
    try {
      const variantsFlags = variants.map(() => true)
      if (shapefile) {
        const mods = shapefile.features.map((feat) => {
          const segments = []
          const coords: GeoJSON.Position[][] = getCoordinatesFromFeature(feat)

          // Make a segment from each LineString.
          for (let i = 0; i < coords.length; i++) {
            segments.push({
              geometry: {
                type: 'LineString',
                coordinates: coords[i]
              },
              spacing: autoCreateStops ? stopSpacingMeters : 0,
              stopAtStart: false,
              stopAtEnd: false,
              fromStopId: null,
              toStopId: null
            })
          }

          if (segments.length > 0) {
            segments[0].stopAtStart = true
            segments[segments.length - 1].stopAtEnd = true
          }

          const mod = createAddTripPattern({
            name: feat.properties[nameInput.value] || 'Add Trip Pattern',
            projectId,
            variants: variantsFlags
          })

          const timetable = createTimetable(
            segments.map(() => feat.properties[speedInput.value])
          )
          timetable.headwaySecs = feat.properties[freqInput.value] * 60

          mod.bidirectional = bidirectional
          mod.segments = segments
          mod.timetables = [timetable]

          return mod
        })

        // Create the modifications
        await dispatch(createModifications(mods))

        // If it finishes without error, redirect to the modifications list
        routeToModifications()
      }
    } catch (e) {
      logrocket.captureException(e)
      setError(e.message || 'Error uploading')
      setUploading(false)
    }
  }

  return (
    <Stack p={4} spacing={4}>
      <Heading size='md'>{message('modification.importFromShapefile')}</Heading>

      <FormControl>
        <FormLabel htmlFor='fileInput'>
          {message('shapefile.selectZipped')}
        </FormLabel>
        <Input
          id='fileInput'
          onChange={file.onChangeFiles}
          type='file'
          value={file.value}
        />
        <FileSizeInputHelper />
      </FormControl>

      {error && (
        <Alert status='error'>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {properties && shapefile && (
        <Stack spacing={4}>
          <FormControl>
            <FormLabel htmlFor={nameInput.id}>Name property</FormLabel>
            <Select {...nameInput}>
              {properties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor={freqInput.id}>Frequency property</FormLabel>
            <Select {...freqInput}>
              {properties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor={speedInput.id}>Speed property</FormLabel>
            <Select {...speedInput}>
              {properties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </FormControl>

          <Checkbox
            isChecked={bidirectional}
            name='bidirectional'
            onChange={(e) => setBidirectional(e.target.checked)}
          >
            Bidirectional
          </Checkbox>

          <Checkbox
            isChecked={autoCreateStops}
            name='autoCreateStops'
            onChange={(e) => setAutoCreateStops(e.target.checked)}
          >
            {message('transitEditor.autoCreateStops')}
          </Checkbox>

          {autoCreateStops && (
            <NumberInput
              label='Stop spacing (meters)'
              onChange={setStopSpacingMeters}
              value={stopSpacingMeters}
            />
          )}
        </Stack>
      )}

      <Button
        isDisabled={!shapefile || uploading}
        isLoading={uploading}
        loadingText='Creating modifications...'
        onClick={create}
        colorScheme='green'
      >
        {message('project.importAction')}
      </Button>
    </Stack>
  )
}
