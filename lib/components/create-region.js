import {
  Alert,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from '@chakra-ui/core'
import {faMap} from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'
import {withRouter} from 'next/router'
import React from 'react'

import {SPACING_FORM} from 'lib/constants/chakra'
import {DEFAULT_BOUNDS} from 'lib/constants/region'
import message from 'lib/message'
import reprojectCoordinates from 'lib/utils/reproject-coordinates'
import {routeTo} from 'lib/router'

import EditBoundsForm from './edit-bounds-form'
import Icon from './icon'
import InnerDock from './inner-dock'

const EditBounds = dynamic(() => import('./map/edit-bounds'), {ssr: false})

/**
 * Create a region.
 */
function CreateRegion(p) {
  const [osmData, setOsmData] = React.useState()
  const [error, setError] = React.useState()
  const [uploading, setUploading] = React.useState(false)
  const [bounds, setBounds] = React.useState(DEFAULT_BOUNDS)
  const [description, setDescription] = React.useState('')
  const [name, setName] = React.useState('')

  // Ready to submit form?
  const readyToCreate = osmData && name && name.length > 0

  // Render into map
  const {setMapChildren} = p
  React.useEffect(() => {
    setMapChildren(() => <EditBounds bounds={bounds} save={setBounds} />)
    return () => setMapChildren(() => <React.Fragment />)
  }, [bounds, setMapChildren, setBounds])

  function _changeCustomOsm(e) {
    setOsmData(e.target.files[0])
  }

  // Create/save will keep checking load status and redirect to the region page
  function _create() {
    const nw = reprojectCoordinates({lat: bounds.north, lon: bounds.west})
    const se = reprojectCoordinates({lat: bounds.south, lon: bounds.east})
    const b = {north: nw.lat, west: nw.lon, south: se.lat, east: se.lon}

    // Validate the bounds
    const boundsIsNaN =
      isNaN(b.north) || isNaN(b.south) || isNaN(b.east) || isNaN(b.west)
    if (boundsIsNaN) {
      window.alert('Bounds must be valid coordinates.')
      return
    }

    setUploading(true)

    // Construct the form data object
    const formData = new window.FormData()
    formData.append('region', JSON.stringify({name, description, bounds}))
    formData.append('customOpenStreetMapData', osmData)
    p.create(formData)
      .then(region => {
        const {as, href} = routeTo('projects', {regionId: region._id})
        p.router.push(href, as)
      })
      .catch(e => {
        setError(e)
        setUploading(false)
      })
  }

  return (
    <InnerDock>
      <Stack p={SPACING_FORM} spacing={SPACING_FORM}>
        <Heading size='md'>
          <Icon icon={faMap} /> <span> {message('region.createAction')}</span>
        </Heading>

        {error && <Alert status='danger'>{error}</Alert>}

        <FormControl
          isDisabled={uploading}
          isRequired
          isInvalid={name.length < 1}
        >
          <FormLabel>{message('region.name')}</FormLabel>
          <Input
            name={message('region.name')}
            onChange={e => setName(e.target.value)}
            placeholder={message('region.name')}
            type='text'
            value={name}
          />
        </FormControl>

        <FormControl isDisabled={uploading}>
          <FormLabel>{message('region.description')}</FormLabel>
          <Input
            onChange={e => setDescription(e.target.value)}
            placeholder={message('region.description')}
            type='text'
            value={description}
          />
        </FormControl>

        <EditBoundsForm
          bounds={bounds}
          isDisabled={uploading}
          onChange={(d, v) => setBounds(b => ({...b, [d]: v}))}
        />

        <Heading size='sm'>osmconvert crop command</Heading>
        <Alert status='info'>
          {`osmconvert [file].pbf -b="${bounds.west}, ${bounds.south}, ${bounds.east}, ${bounds.north}" --complete-ways -o=[file]-cropped.pbf`}
        </Alert>

        <FormControl isDisabled={uploading} isRequired>
          <FormLabel htmlFor='osm'>
            {message('region.customOpenStreetMapData')}
          </FormLabel>
          <Input id='osm' onChange={_changeCustomOsm} type='file' />
        </FormControl>

        <Button
          block
          isDisabled={!readyToCreate}
          isLoading={uploading}
          leftIcon='check'
          loadingText={message('region.statusCode.UPLOADING_OSM')}
          onClick={_create}
          name={message('region.createAction')}
          size='lg'
          variantColor='green'
        >
          {message('region.createAction')}
        </Button>
      </Stack>
    </InnerDock>
  )
}

// Expsoe next/router to the component
export default withRouter(CreateRegion)
