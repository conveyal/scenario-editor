import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Switch
} from '@chakra-ui/react'
import {FormEvent, useState} from 'react'
import {useDispatch} from 'react-redux'

import useFileInput from 'lib/hooks/use-file-input'
import DocsLink from 'lib/components/docs-link'
import FileSizeInputHelper from 'lib/components/file-size-input-helper'
import {AddIcon} from 'lib/components/icons'
import message from 'lib/message'

import {uploadOpportunityDataset} from '../actions'

/** Create an opportunity dataset by uploading files */
export default function UploadOpportunityDataset({regionId}) {
  const fileInput = useFileInput()
  const [uploading, setUploading] = useState(false)
  const [freeform, setFreeForm] = useState(false)
  const [paired, setPaired] = useState(false)
  const dispatch = useDispatch()

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const body = new window.FormData(e.currentTarget)
    body.set('regionId', regionId)
    body.set('freeform', `${freeform}`)
    setUploading(true)

    // Remove count field if it's empty
    if (freeform && body.has('countField')) {
      const countField = body.get('countField').toString()
      if (countField === '') body.delete('countField')
    }

    dispatch(uploadOpportunityDataset(body))
  }

  // Enable extra fields if it's a CSV file
  const isCSV =
    Array.isArray(fileInput.files) &&
    fileInput.files?.length === 1 &&
    fileInput.files[0].name.toLowerCase().endsWith('.csv')

  return (
    <form onSubmit={submit}>
      <Stack spacing={4}>
        <Heading size='md'>{message('analysis.createGrid')}</Heading>
        <Box>{message('analysis.createGridTooltip')}</Box>
        <FormControl isRequired>
          <FormLabel htmlFor='Name'>
            {message('analysis.gridName')} name
          </FormLabel>
          <Input name='Name' id='Name' />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor='files'>{message('analysis.gridFiles')}</FormLabel>
          <Input
            id='files'
            name='files'
            multiple
            onChange={fileInput.onChangeFiles}
            type='file'
            value={fileInput.value}
          />
          <FileSizeInputHelper />
        </FormControl>

        <Heading size='sm'>CSV Options</Heading>
        <Stack isInline>
          <FormControl flex='1' isRequired isDisabled={!isCSV}>
            <FormLabel htmlFor='latField'>
              {message('analysis.latField')}
            </FormLabel>
            <Input
              defaultValue='lat'
              placeholder='lat'
              id='latField'
              name='latField'
            />
          </FormControl>

          <FormControl flex='1' isRequired isDisabled={!isCSV}>
            <FormLabel htmlFor='lonField'>
              {message('analysis.lonField')}
            </FormLabel>
            <Input
              defaultValue='lon'
              placeholder='lon'
              id='lonField'
              name='lonField'
            />
          </FormControl>
        </Stack>

        <FormControl
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          isDisabled={!isCSV}
        >
          <FormLabel htmlFor='freeform'>
            Enable freeform (non-grid) points{' '}
            <DocsLink pl={1} to='/prepare-inputs/upload-opportunity-data#csv' />
          </FormLabel>

          <Switch
            id='freeform'
            isChecked={freeform}
            isDisabled={!isCSV}
            onChange={() => setFreeForm((ff) => !ff)}
          />
        </FormControl>

        <FormControl isRequired isDisabled={!isCSV || !freeform}>
          <FormLabel htmlFor='idField'>{message('analysis.idField')}</FormLabel>
          <Input id='idField' name='idField' placeholder='id' />
        </FormControl>

        <FormControl isDisabled={!isCSV || !freeform}>
          <FormLabel htmlFor='countField'>
            {message('analysis.countField')}
          </FormLabel>
          <Input id='countField' name='countField' placeholder='count' />
        </FormControl>

        <FormControl
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          isDisabled={!isCSV || !freeform}
        >
          <FormLabel htmlFor='paired'>Paired origin/destination file</FormLabel>

          <Switch
            id='paired'
            isChecked={paired}
            isDisabled={!isCSV || !freeform}
            onChange={() => setPaired((p) => !p)}
          />
        </FormControl>

        <FormControl isRequired isDisabled={!isCSV || !freeform || !paired}>
          <FormLabel htmlFor='latField2'>
            Destination {message('analysis.latField').toLowerCase()}
          </FormLabel>
          <Input id='latField2' name='latField2' />
        </FormControl>

        <FormControl isRequired isDisabled={!isCSV || !freeform || !paired}>
          <FormLabel htmlFor='lonField2'>
            Destination {message('analysis.lonField').toLowerCase()}
          </FormLabel>
          <Input id='lonField2' name='lonField2' />
        </FormControl>

        <Button
          type='submit'
          leftIcon={<AddIcon />}
          isLoading={uploading}
          loadingText={message('common.uploading')}
          colorScheme='green'
        >
          {message('analysis.createGrid')}
        </Button>
      </Stack>
    </form>
  )
}
