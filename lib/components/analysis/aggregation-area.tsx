import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  setActiveAggregationArea,
  setAggregationArea,
  uploadAggregationArea
} from 'lib/actions/aggregation-areas'
import {ChevronDown, ChevronUp} from 'lib/components/icons'
import useInput from 'lib/hooks/use-controlled-input'
import useFileInput from 'lib/hooks/use-file-input'
import message from 'lib/message'
import OpportunityDatasets from 'lib/modules/opportunity-datasets'
import selectActiveAggregationArea from 'lib/selectors/active-aggregation-area'

import Select from '../select'
import FileSizeInputHelper from '../file-size-input-helper'

const selectAggregationAreas = fpGet('region.aggregationAreas')

// Getters for react-select
const getName = fpGet('name')
const getId = fpGet('_id')

export default function AggregationArea({regionId}) {
  const dispatch = useDispatch()
  const activeAggregationArea = useSelector(selectActiveAggregationArea)
  const aas = useSelector(selectAggregationAreas)
  const showUpload = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)

  async function setActive(aa) {
    if (aa) {
      setIsLoading(true)
      await dispatch(setAggregationArea(aa))
      setIsLoading(false)
    } else {
      dispatch(setActiveAggregationArea())
    }
  }

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>{message('analysis.aggregateTo')}</FormLabel>
        <Select
          isClearable
          isLoading={isLoading}
          name='aggregateTo'
          getOptionLabel={getName}
          getOptionValue={getId}
          options={aas}
          value={aas.find((aa) => aa._id === get(activeAggregationArea, '_id'))}
          onChange={setActive}
        />
      </FormControl>

      <Button
        isFullWidth
        leftIcon={showUpload.isOpen ? <ChevronUp /> : <ChevronDown />}
        onClick={showUpload.onToggle}
      >
        {showUpload.isOpen ? 'Hide' : message('analysis.newAggregationArea')}
      </Button>

      {showUpload.isOpen && (
        <Box>
          <UploadNewAggregationArea
            onClose={showUpload.onClose}
            regionId={regionId}
          />
        </Box>
      )}

      {activeAggregationArea && (
        <FormControl>
          <FormLabel>{message('analysis.weightBy')}</FormLabel>
          <OpportunityDatasets.components.Selector regionId={regionId} />
        </FormControl>
      )}
    </Stack>
  )
}

function UploadNewAggregationArea({onClose, regionId}) {
  const dispatch = useDispatch()
  const [union, setUnion] = useState(true)
  const file = useFileInput()
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  const nameInput = useInput({value: ''})
  const attributeInput = useInput({value: 'attribute'})

  async function upload() {
    setUploading(true)

    const formData = new window.FormData()
    formData.append('name', nameInput.value)
    formData.append('nameProperty', attributeInput.value)
    formData.append('union', `${union}`)
    ;[...files].forEach((file) => formData.append('files', file))

    try {
      const newAAs = await dispatch(uploadAggregationArea(formData, regionId))
      toast({
        position: 'top',
        status: 'success',
        title: 'Upload complete.',
        description: 'Aggregation area(s) have been successfully created.',
        isClosable: true
      })

      if (newAAs && newAAs.length > 0) {
        await dispatch(setAggregationArea(newAAs[0]))
      }
      onClose()
    } catch (e) {
      setUploading(false)
    }
  }

  return (
    <Stack spacing={4}>
      <FormControl isDisabled={uploading} isRequired>
        <FormLabel htmlFor={nameInput.id}>
          {message('analysis.aggregationAreaName')}
        </FormLabel>
        <Input {...nameInput} />
      </FormControl>

      <FormControl isDisabled={uploading} isRequired>
        <FormLabel htmlFor='aggregationAreaFiles'>
          {message('analysis.aggregationAreaFiles')}
        </FormLabel>
        <Input
          id='aggregationAreaFiles'
          multiple
          onChange={file.onChangeFiles}
          type='file'
          value={file.value}
        />
        <FileSizeInputHelper />
      </FormControl>

      <Checkbox
        isChecked={union}
        isDisabled={uploading}
        onChange={(e) => setUnion(e.target.checked)}
      >
        Union
      </Checkbox>

      {!union && (
        <Stack spacing={4}>
          <Alert status='warning'>{message('analysis.separateFeatures')}</Alert>
          <FormControl isDisabled={uploading} isRequired>
            <FormLabel htmlFor={attributeInput.id}>
              {message('analysis.attributeName')}
            </FormLabel>
            <Input {...attributeInput} />
          </FormControl>
        </Stack>
      )}

      <Button
        isFullWidth
        isDisabled={uploading || !nameInput.value || !files}
        isLoading={uploading}
        loadingText='Creating aggregation area'
        onClick={upload}
        colorScheme='green'
      >
        {message('common.upload')}
      </Button>
    </Stack>
  )
}
