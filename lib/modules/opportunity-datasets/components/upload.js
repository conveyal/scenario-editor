import {faPlus, faSpinner} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import React from 'react'
import {useDispatch} from 'react-redux'

import {Button} from 'lib/components/buttons'
import H5 from 'lib/components/h5'
import Icon from 'lib/components/icon'
import {File, Text, Checkbox} from 'lib/components/input'
import message from 'lib/message'
import P from 'lib/components/p'
import {Box} from '@chakra-ui/core'

import {uploadOpportunityDataset} from '../actions'

/** Create an opportunity dataset by uploading files */
export default function UploadOpportunityDataset({regionId}) {
  const [name, setName] = React.useState('')
  const [files, setFiles] = React.useState()
  const [uploading, setUploading] = React.useState(false)
  const [isCSV, setIsCSV] = React.useState(false)
  const [freeform, setFreeForm] = React.useState(false)
  const [paired, setPaired] = React.useState(false)
  const formRef = React.useRef()
  const dispatch = useDispatch()

  function submit(e) {
    e.preventDefault()
    const body = new window.FormData(formRef.current)
    body.append('freeform', freeform)
    body.append('paired', paired)
    body.append('regionId', regionId)
    setUploading(true)
    dispatch(uploadOpportunityDataset(body))
  }

  function onChangeFiles(e) {
    const files = e.target.files
    setFiles(files)
    // signal if it's a CSV file; if so, we need to show extra fields
    // if it's a shapefile, this is not needed
    setIsCSV(
      get(files, 'length') === 1 &&
        get(files, '[0].name', '')
          .toLowerCase()
          .endsWith('.csv')
    )
  }

  return (
    <>
      <H5>{message('analysis.createGrid')}</H5>
      <P>{message('analysis.createGridTooltip')}</P>
      <form encType='multipart/form-data' ref={formRef}>
        <Text
          name='Name'
          label={`${message('analysis.gridName')}*`}
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <File
          multiple
          label={`${message('analysis.gridFiles')}*`}
          name='files'
          onChange={onChangeFiles}
        />

        {isCSV && (
          <>
            <Text name='latField' label={message('analysis.latField')} />

            <Text name='lonField' label={message('analysis.lonField')} />

            <Box className='DEV'>
              {
                <Checkbox
                  label={message('opportunityDatasets.freeform')}
                  checked={freeform}
                  onChange={e => setFreeForm(e.target.checked)}
                />
              }

              {freeform && (
                <>
                  <Text name='idField' label={message('analysis.idField')} />
                  <Text
                    name='countField'
                    label={message('analysis.countField')}
                  />

                  <Checkbox
                    label={message('opportunityDatasets.paired')}
                    checked={paired}
                    onChange={e => setPaired(e.target.checked)}
                  />

                  {paired && (
                    <>
                      <Text
                        name='latField2'
                        label={message('analysis.latField')}
                      />

                      <Text
                        name='lonField2'
                        label={message('analysis.lonField')}
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          </>
        )}

        <Button
          className='btn btn-block btn-success'
          disabled={uploading || !name || !files}
          onClick={submit}
          type='success'
        >
          {uploading ? (
            <>
              <Icon icon={faSpinner} fixedWidth spin />{' '}
              {message('analysis.uploading')}
            </>
          ) : (
            <>
              <Icon icon={faPlus} fixedWidth /> {message('analysis.createGrid')}
            </>
          )}
        </Button>
      </form>
    </>
  )
}
