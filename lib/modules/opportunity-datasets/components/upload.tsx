import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from '@chakra-ui/core'
import get from 'lodash/get'
import {useRef, useState} from 'react'
import {useDispatch} from 'react-redux'

import useInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'

import {uploadOpportunityDataset} from '../actions'

/** Create an opportunity dataset by uploading files */
export default function UploadOpportunityDataset({regionId}) {
  const nameInput = useInput({value: ''})
  const [files, setFiles] = useState()
  const [uploading, setUploading] = useState(false)
  const [freeform, setFreeForm] = useState(false)
  const [paired, setPaired] = useState(false)
  const formRef = useRef()
  const dispatch = useDispatch()

  function submit(e) {
    e.preventDefault()
    const body = new window.FormData(formRef.current)
    body.append('freeform', `${freeform}`)
    body.append('paired', `${paired}`)
    body.append('regionId', regionId)
    body.append('Name', nameInput.value)
    setUploading(true)
    dispatch(uploadOpportunityDataset(body))
  }

  // signal if it's a CSV file; if so, we need to show extra fields
  // if it's a shapefile, this is not needed
  const isCSV =
    get(files, 'length') === 1 &&
    get(files, '[0].name', '').toLowerCase().endsWith('.csv')

  return (
    <Stack spacing={4}>
      <Heading size='md'>{message('analysis.createGrid')}</Heading>
      <Box>{message('analysis.createGridTooltip')}</Box>
      <Box as='form' ref={formRef}>
        <Stack spacing={4}>
          <FormControl isRequired isInvalid={nameInput.isInvalid}>
            <FormLabel htmlFor={nameInput.id}>
              {message('analysis.gridName')} name
            </FormLabel>
            <Input {...nameInput} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor='files'>
              {message('analysis.gridFiles')}
            </FormLabel>
            <Input
              id='files'
              name='files'
              multiple
              onChange={(e) => setFiles(e.target.files)}
              type='file'
            />
          </FormControl>

          {isCSV && (
            <Stack spacing={4}>
              <Stack isInline>
                <FormControl flex='1' isRequired>
                  <FormLabel htmlFor='latField'>
                    {message('analysis.latField')}
                  </FormLabel>
                  <Input defaultValue='lat' id='latField' name='latField' />
                </FormControl>

                <FormControl flex='1' isRequired>
                  <FormLabel htmlFor='lonField'>
                    {message('analysis.lonField')}
                  </FormLabel>
                  <Input defaultValue='lon' id='lonField' name='lonField' />
                </FormControl>
              </Stack>

              <Checkbox
                isChecked={freeform}
                onChange={(e) => setFreeForm(e.target.checked)}
              >
                {message('opportunityDatasets.freeform')}
              </Checkbox>

              {freeform && (
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel htmlFor='idField'>
                      {message('analysis.idField')}
                    </FormLabel>
                    <Input id='idField' name='idField' />
                  </FormControl>

                  <FormControl>
                    <FormLabel htmlFor='countField'>
                      {message('analysis.countField')}
                    </FormLabel>
                    <Input id='countField' name='countField' />
                  </FormControl>

                  <Checkbox
                    isChecked={paired}
                    onChange={(e) => setPaired(e.target.checked)}
                  >
                    {message('opportunityDatasets.paired')}
                  </Checkbox>

                  {paired && (
                    <Stack isInline>
                      <FormControl isRequired>
                        <FormLabel htmlFor='latField2'>
                          {message('analysis.latField')}
                        </FormLabel>
                        <Input id='latField2' name='latField2' />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel htmlFor='lonField2'>
                          {message('analysis.lonField')}
                        </FormLabel>
                        <Input id='lonField2' name='lonField2' />
                      </FormControl>
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>
          )}

          <Button
            leftIcon='small-add'
            isLoading={uploading}
            isDisabled={uploading || !nameInput.value || !files}
            loadingText={message('analysis.uploading')}
            onClick={submit}
            variantColor='green'
          >
            {message('analysis.createGrid')}
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}
