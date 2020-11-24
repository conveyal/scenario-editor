import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast
} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import {useState} from 'react'

import ConfirmButton from 'lib/components/confirm-button'
import EditBoundsForm from 'lib/components/edit-bounds-form'
import FullSpinner from 'lib/components/full-spinner'
import InnerDock from 'lib/components/inner-dock'
import {SPACING_FORM} from 'lib/constants/chakra'
import useInput from 'lib/hooks/use-controlled-input'
import {useRegion} from 'lib/hooks/use-model'
import useRouteTo from 'lib/hooks/use-route-to'
import MapLayout from 'lib/layouts/map'
import message from 'lib/message'
import {boundsAreValid} from 'lib/utils/bounds'
import reprojectCoordinates from 'lib/utils/reproject-coordinates'

const hasLength = (s: void | string) => s && s.length > 0

export default function LoadRegion() {
  const router = useRouter()
  const regionId = router.query.regionId as string
  const {data: region, response, update, remove} = useRegion(regionId)
  if (response.error) return <p>{response.error.problem}</p>
  if (!region) return <FullSpinner />
  return <EditRegion region={region} remove={remove} update={update} />
}

// Add the MapLayout
LoadRegion.Layout = MapLayout

/**
 * Use a separate component for the form due for the input hooks.
 */
function EditRegion({region, remove, update}) {
  const goToHome = useRouteTo('regions')
  const [bounds, setBounds] = useState(region.bounds)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const nameInput = useInput({
    test: hasLength,
    value: region.name
  })
  const descriptionInput = useInput({value: region.description})

  // Delete region action
  async function _delete() {
    const res = await remove()
    if (res.ok) {
      goToHome()
      toast({
        title: 'Region deleted',
        description: 'Region has been successfully deleted.',
        position: 'top',
        status: 'success'
      })
    } else {
      toast({
        title: 'Error deleting region',
        description: res.data.message,
        position: 'top',
        status: 'error',
        isClosable: true,
        duration: null
      })
    }
  }

  // Save region action
  async function _save() {
    setSaving(true)

    // Save will redirect back to main region page when complete
    const nw = reprojectCoordinates({
      lat: bounds.north,
      lon: bounds.west
    })
    const se = reprojectCoordinates({
      lat: bounds.south,
      lon: bounds.east
    })
    const newBounds = {north: nw.lat, west: nw.lon, south: se.lat, east: se.lon}

    const res = await update({
      bounds: newBounds,
      name: nameInput.value,
      description: descriptionInput.value
    })

    setSaving(false)
    if (res.ok) {
      toast({
        title: 'Region updated',
        description: 'Your changes have been saved.',
        position: 'top',
        status: 'success'
      })
    } else {
      toast({
        title: 'Error updating region',
        description: res.data.message,
        position: 'top',
        status: 'error',
        isClosable: true,
        duration: null
      })
    }
  }

  const isEqual =
    region.bounds === bounds &&
    region.name === nameInput.value &&
    region.description === descriptionInput.value

  return (
    <InnerDock>
      <Stack p={SPACING_FORM} spacing={SPACING_FORM}>
        <Heading size='md'>{message('region.editTitle')}</Heading>

        <FormControl isRequired isInvalid={nameInput.isInvalid}>
          <FormLabel htmlFor={nameInput.id}>{message('region.name')}</FormLabel>
          <Input {...nameInput} />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor={descriptionInput.id}>
            {message('region.description')}
          </FormLabel>
          <Input
            {...descriptionInput}
            placeholder={message('region.description')}
          />
        </FormControl>

        <EditBoundsForm
          bounds={bounds}
          isDisabled={saving}
          setBounds={setBounds}
        />

        <Button
          isDisabled={isEqual || !boundsAreValid(bounds)}
          isFullWidth
          isLoading={saving}
          onClick={_save}
          loadingText={'Saving region'}
          size='lg'
          variantColor='green'
        >
          {message('region.editAction')}
        </Button>

        <ConfirmButton
          description={message('region.deleteConfirmation')}
          isFullWidth
          leftIcon='delete'
          onConfirm={_delete}
          size='lg'
          variantColor='red'
        >
          {message('region.deleteAction')}
        </ConfirmButton>
      </Stack>
    </InnerDock>
  )
}
