import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Switch
} from '@chakra-ui/core'
import get from 'lodash/get'
import {FormEvent, useState} from 'react'
import {useDispatch} from 'react-redux'

import message from 'lib/message'

import DocsLink from 'lib/components/docs-link'
import {uploadOpportunityDataset} from '../actions'

/** Create an opportunity dataset by uploading files */
export default function UploadOpportunityDataset({regionId}) {
  const [files, setFiles] = useState()
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
    dispatch(uploadOpportunityDataset(body))
  }

  // Enable extra fields if it's a CSV file
  const isCSV =
    get(files, 'length') === 1 &&
    get(files, '[0].name', '').toLowerCase().endsWith('.csv')

  return (
    <Stack as='form' spacing={4} onSubmit={submit}>
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
          onChange={(e) => setFiles(e.target.files)}
          type='file'
        />
      </FormControl>

      <Heading size='sm'>CSV Options</Heading>
      <Stack isInline>
        <FormControl flex='1' isRequired isDisabled={!isCSV}>
          <FormLabel htmlFor='latField'>
            {message('analysis.latField')}
          </FormLabel>
          <Input placeholder='lat' id='latField' name='latField' />
        </FormControl>

        <FormControl flex='1' isRequired isDisabled={!isCSV}>
          <FormLabel htmlFor='lonField'>
            {message('analysis.lonField')}
          </FormLabel>
          <Input placeholder='lon' id='lonField' name='lonField' />
        </FormControl>
      </Stack>

      <FormControl
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        isDisabled={!isCSV}
      >
        <FormLabel htmlFor='freeform'>
          Enable free form{' '}
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

      <FormControl isRequired isDisabled={!isCSV || !freeform}>
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
        leftIcon='small-add'
        isLoading={uploading}
        loadingText={message('analysis.uploading')}
        variantColor='green'
      >
        {message('analysis.createGrid')}
      </Button>
    </Stack>
  )
}
