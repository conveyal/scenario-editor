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
  Stack,
  useToast
} from '@chakra-ui/react'
import {useCallback, useEffect, useState} from 'react'
import shp from 'shpjs'

import useInput from 'lib/hooks/use-controlled-input'
import useFileInput from 'lib/hooks/use-file-input'
import useRouteTo from 'lib/hooks/use-route-to'
import useRouterQuery from 'lib/hooks/use-router-query'
import logrocket from 'lib/logrocket'
import message from 'lib/message'
import createModifications from 'lib/modification/mutations/create-from-shapefile'

import NumberInput from './number-input'
import FileSizeInputHelper from './file-size-input-helper'

const hasOwnProperty = (o, p) => Object.prototype.hasOwnProperty.call(o, p)

/**
 * Import a shapefile. This more or less does what geom2gtfs used to.
 */
export default function ImportShapefile() {
  const [shapefile, setShapefile] =
    useState<shp.FeatureCollectionWithFilename>(null)
  const [stopSpacingMeters, setStopSpacingMeters] = useState(400)
  const [bidirectional, setBidirectional] = useState(true)
  const [autoCreateStops, setAutoCreateStops] = useState(true)
  const nameInput = useInput({value: ''})
  const freqInput = useInput({value: ''})
  const speedInput = useInput({value: ''})
  const [error, setError] = useState<string>(null)
  const [properties, setProperties] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInput = useFileInput()
  const toast = useToast({position: 'top', status: 'success', isClosable: true})
  const {files} = fileInput

  const {projectId, regionId} = useRouterQuery()
  const routeToModifications = useRouteTo('modifications', {
    projectId,
    regionId
  })

  const onChangeName = nameInput.onChange
  const onChangeFreq = freqInput.onChange
  const onChangeSpeed = speedInput.onChange
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
        onChangeName(properties[0])
        onChangeFreq(properties[0])
        onChangeSpeed(properties[0])
        setError(null)
      }
    },
    [onChangeFreq, onChangeName, onChangeSpeed]
  )

  useEffect(() => {
    if (files && files[0]) {
      const reader = new window.FileReader()
      reader.onloadend = readShapeFile
      reader.readAsArrayBuffer(files[0])
    }
  }, [files, readShapeFile])

  // Create and save modifications for each line
  async function create() {
    setUploading(true)
    try {
      if (shapefile) {
        const res = await createModifications(
          projectId,
          shapefile,
          autoCreateStops,
          stopSpacingMeters,
          bidirectional,
          nameInput.value,
          speedInput.value,
          freqInput.value
        )
        if (res.ok === false) throw res.error
        // If it finishes without error, redirect to the modifications list
        toast({
          title: 'Import successful'
        })
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
          onChange={fileInput.onChangeFiles}
          type='file'
          value={fileInput.value}
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
