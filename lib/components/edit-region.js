import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from '@chakra-ui/core'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch} from 'react-redux'

import {deleteRegion, save} from 'lib/actions/region'
import {SPACING_FORM} from 'lib/constants/chakra'
import message from 'lib/message'
import reprojectCoordinates from 'lib/utils/reproject-coordinates'

import ConfirmButton from './confirm-button'
import EditBoundsForm from './edit-bounds-form'
import InnerDock from './inner-dock'

const EditBounds = dynamic(() => import('./map/edit-bounds'), {ssr: false})

/**
 * Bounds editor will automatically fit map to bounds.
 */
export function EditRegion(p) {
  const [region, setRegion] = React.useState(p.region)
  const [saving, setSaving] = React.useState(false)
  // Keep track if it has been edited
  const hasBeenEdited = p.region !== region
  // Dispatch and router passed as props for testing purposes
  const {dispatch, router} = p
  const {bounds} = region

  // Delete region action
  function _delete() {
    // Delete that region
    return dispatch(deleteRegion(region._id)).then(() => {
      // Then go to the region selection page
      router.push('/')
    })
  }

  // Save region action
  function _save() {
    setSaving(true)

    // Save will redirect back to main region page when complete
    const nw = reprojectCoordinates({lat: bounds.north, lon: bounds.west})
    const se = reprojectCoordinates({lat: bounds.south, lon: bounds.east})
    const newBounds = {north: nw.lat, west: nw.lon, south: se.lat, east: se.lon}
    dispatch(save({...region, bounds: newBounds})).then(r => {
      setRegion(r)
      setSaving(false)
    })
  }

  // Helper function to set a specific direction of the bounds
  function setBoundsFor(direction, newValue) {
    setRegion(r => ({...r, bounds: {...r.bounds, [direction]: newValue}}))
  }

  function onChangeName(e) {
    const name = e.target.value
    setRegion(r => ({...r, name}))
  }

  function onChangeDescription(e) {
    const description = e.target.value
    setRegion(r => ({...r, description}))
  }

  // Render into map
  const {setMapChildren} = p
  React.useEffect(() => {
    setMapChildren(() => (
      <EditBounds
        bounds={bounds}
        save={b => setRegion(r => ({...r, bounds: b}))}
      />
    ))
    return () => setMapChildren(() => <React.Fragment />)
  }, [bounds, setRegion, setMapChildren])

  return (
    <InnerDock>
      <Stack p={SPACING_FORM} spacing={SPACING_FORM}>
        <Heading size='md'>{message('region.editTitle')}</Heading>

        <FormControl isRequired isInvalid={get(region, 'name.length') < 1}>
          <FormLabel>{message('region.name')}</FormLabel>
          <Input
            onChange={onChangeName}
            placeholder={message('region.name')}
            type='text'
            value={region.name}
          />
        </FormControl>

        <FormControl>
          <FormLabel>{message('region.description')}</FormLabel>
          <Input
            onChange={onChangeDescription}
            placeholder={message('region.description')}
            type='text'
            value={region.description || ''}
          />
        </FormControl>

        <EditBoundsForm
          bounds={bounds}
          isDisabled={saving}
          onChange={setBoundsFor}
        />

        <Button
          block
          isDisabled={!hasBeenEdited}
          isLoading={saving}
          onClick={_save}
          loadingText={'Saving region'}
          size='lg'
          variantColor='green'
        >
          {message('region.editAction')}
        </Button>

        <ConfirmButton
          action={message('region.deleteAction')}
          block
          description={message('region.deleteConfirmation')}
          leftIcon='delete'
          onConfirm={_delete}
          size='lg'
          variantColor='red'
        />
      </Stack>
    </InnerDock>
  )
}

/**
 * Export a connected version by default.
 */
export default function ConnectedEditRegion(p) {
  const dispatch = useDispatch()
  const router = useRouter()

  return <EditRegion {...p} dispatch={dispatch} router={router} />
}
