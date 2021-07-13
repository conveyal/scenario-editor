import {
  Alert,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  useToast,
  FormErrorMessage,
  ModalHeader,
  Stack,
  ModalFooter
} from '@chakra-ui/react'
import {dequal} from 'dequal/lite'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import {memo, useCallback, useEffect, useState} from 'react'

import {usePresets} from 'lib/hooks/use-collection'
import useInput from 'lib/hooks/use-controlled-input'
import {useCurrentRegionId} from 'lib/hooks/use-current-region'

import {ConfirmDialog} from './confirm-button'
import IconButton from './icon-button'
import {AddIcon, DeleteIcon, EditIcon} from './icons'
import ObjectToTable from './object-to-table'
import Select from './select'

// Number precision
const isWithinTolerance = (n1: number, n2: number) => Math.abs(n1 - n2) < 1e-6

// Select `get`s
const getId = fpGet('_id')
const getOptionLabel = fpGet('name')

// For input validation
const hasName = (n?: string) => n?.length > 0

/**
 * Presets contain many more parameters than we use in the UI. Only check the ones from there.
 */
function findPreset(
  settings: Record<string, unknown>,
  presets: CL.Preset[] = []
) {
  return presets.find(
    ({profileRequest}) =>
      Object.keys(profileRequest).find((k) => {
        const v = profileRequest[k]
        const s = settings[k]
        if (typeof v === 'number' && typeof s === 'number') {
          return !isWithinTolerance(v, s)
        }
        return !dequal(v, s)
      }) == null
  )
}

type Props = {
  currentLonLat: {lat: number; lon: number}
  currentSettings: Record<string, unknown>
  isDisabled: boolean
  isComparison?: boolean
  onChange: (preset: Record<string, unknown>) => void
}

/**
 * Form controls for selecting, creating, and managing presets.
 */
export default memo<Props>(function PresetChooser({
  currentSettings,
  currentLonLat,
  isDisabled,
  isComparison = false,
  onChange
}) {
  const regionId = useCurrentRegionId()
  const presetsCollection = usePresets({
    query: {regionId},
    options: {sort: {name: 1}}
  })
  const toast = useToast()
  const createPresetAction = useDisclosure()
  const editPresetAction = useDisclosure()
  const [selectedPreset, setSelectedPreset] = useState<CL.Preset>()

  // ID to differentiate between primary and comparison
  const id = 'select-preset-' + isComparison

  // Check the presets to see if they match any settings
  const presets = presetsCollection.data
  useEffect(() => {
    setSelectedPreset(
      findPreset(
        {
          ...currentSettings,
          fromLat: currentLonLat.lat,
          fromLon: currentLonLat.lon
        },
        presets
      )
    )
  }, [presets, currentLonLat, currentSettings, setSelectedPreset])

  // Select a new preset and load it's contents
  const _selectPreset = useCallback(
    (e) => {
      const preset = presets.find((b) => b._id === e._id)
      if (preset) {
        onChange(preset.profileRequest)
      }
    },
    [onChange, presets]
  )

  // Remove a preset and show a toast on success
  const _removePreset = useCallback(
    async (_id) => {
      const res = await presetsCollection.remove(_id)
      if (res.ok) {
        toast({
          title: 'Deleted selected preset',
          position: 'top',
          status: 'success',
          isClosable: true
        })
      } else {
        toast({
          title: 'Error deleting preset',
          description: get(res, 'data.description'),
          position: 'top',
          status: 'error',
          duration: null,
          isClosable: true
        })
      }
    },
    [presetsCollection, toast]
  )

  return (
    <FormControl
      isDisabled={isDisabled}
      isInvalid={!!presetsCollection.response.error}
    >
      <Flex justify='space-between'>
        <FormLabel htmlFor={id}>Active preset</FormLabel>
        <Stack isInline spacing={1}>
          {!selectedPreset && (
            <Button
              isDisabled={isDisabled}
              onClick={createPresetAction.onOpen}
              rightIcon={<AddIcon />}
              size='xs'
              colorScheme='green'
            >
              Save
            </Button>
          )}
          {selectedPreset && (
            <IconButton
              isDisabled={isDisabled}
              label='Edit preset name'
              onClick={editPresetAction.onOpen}
              size='xs'
              colorScheme='yellow'
            >
              <EditIcon />
            </IconButton>
          )}
          {selectedPreset && (
            <ConfirmDialog
              description='Are you sure you want to delete this preset?'
              onConfirm={() => _removePreset(get(selectedPreset, '_id'))}
            >
              <IconButton
                label='Delete selected preset'
                size='xs'
                colorScheme='red'
              >
                <DeleteIcon />
              </IconButton>
            </ConfirmDialog>
          )}
        </Stack>
      </Flex>
      <div>
        {get(presets, 'length') > 0 ? (
          <Select
            name={id}
            inputId={id}
            isDisabled={isDisabled}
            key={getId(selectedPreset)}
            getOptionLabel={getOptionLabel}
            getOptionValue={getId}
            options={presets as any}
            onChange={_selectPreset}
            placeholder='Select a preset'
            value={selectedPreset as any}
          />
        ) : (
          <Alert status='info'>Save presets to be used later.</Alert>
        )}
      </div>
      {presetsCollection.error && (
        <FormErrorMessage>Error loading presets.</FormErrorMessage>
      )}

      {createPresetAction.isOpen && (
        <CreatePreset
          create={presetsCollection.create}
          currentSettings={{
            ...currentSettings,
            fromLat: currentLonLat.lat,
            fromLon: currentLonLat.lon
          }}
          onClose={createPresetAction.onClose}
          regionId={regionId}
        />
      )}

      {selectedPreset && editPresetAction.isOpen && (
        <EditPreset
          onClose={editPresetAction.onClose}
          preset={selectedPreset}
          update={presetsCollection.update}
        />
      )}
    </FormControl>
  )
})

/**
 * Modal for creating new presets.
 */
function CreatePreset({create, currentSettings, onClose, regionId}) {
  const toast = useToast()
  const nameInput = useInput({test: hasName, value: ''})
  const [isCreating, setIsCreating] = useState(false)

  // Create a new preset based on current settings and show a toast on success.
  async function _create() {
    setIsCreating(true)
    const res = await create({
      name: nameInput.value,
      profileRequest: currentSettings,
      regionId
    })
    setIsCreating(false)

    if (res.ok) {
      toast({
        title: 'Created new preset',
        position: 'top',
        status: 'success',
        isClosable: true
      })
      onClose()
    } else {
      toast({
        title: 'Error creating preset',
        description: get(res, 'data.description'),
        position: 'top',
        status: 'error',
        duration: null,
        isClosable: true
      })
    }
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={true}
      onClose={onClose}
      initialFocusRef={nameInput.ref}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create preset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={nameInput.isInvalid} isRequired>
            <FormLabel htmlFor={nameInput.id}>Name</FormLabel>
            <Input {...nameInput} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={nameInput.isInvalid}
            isLoading={isCreating}
            onClick={_create}
            colorScheme='green'
          >
            Create preset
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/**
 * Modal for editing presets.
 */
function EditPreset({preset, onClose, update}) {
  const nameInput = useInput({test: hasName, value: preset.name})
  const [isSaving, setIsSaving] = useState(false)
  const toast = useToast()

  async function _update() {
    setIsSaving(true)
    const res = await update(preset._id, {name: nameInput.value})
    setIsSaving(false)

    // Return value from collection.update is the new array of results
    if (res.ok) {
      toast({
        title: 'Saved changes to preset',
        position: 'top',
        status: 'success',
        isClosable: true
      })
      onClose()
    } else {
      toast({
        title: 'Error saving preset',
        description: get(res, 'data.description'),
        position: 'top',
        status: 'error',
        duration: null,
        isClosable: true
      })
    }
  }

  return (
    <Modal closeOnOverlayClick={false} isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit preset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={nameInput.isInvalid} isRequired>
            <FormLabel htmlFor={nameInput.id}>Name</FormLabel>
            <Input {...nameInput} />
          </FormControl>
          <Box mt={4}>
            <details>
              <summary>Preset values</summary>
              <ObjectToTable object={preset.profileRequest} />
            </details>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={nameInput.isInvalid}
            isLoading={isSaving}
            onClick={_update}
            colorScheme='green'
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
