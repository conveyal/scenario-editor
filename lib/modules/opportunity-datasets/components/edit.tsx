import {Button, ButtonGroup, Divider, Heading, Stack} from '@chakra-ui/react'
import {useDispatch} from 'react-redux'

import ConfirmButton from 'lib/components/confirm-button'
import Editable from 'lib/components/editable'
import {DownloadIcon, DeleteIcon} from 'lib/components/icons'
import message from 'lib/message'

import {
  deleteOpportunityDataset,
  deleteSourceSet,
  downloadOpportunityDataset,
  editOpportunityDataset
} from '../actions'

function LabelHeading({children, ...p}) {
  return (
    <Heading
      color='gray.500'
      fontWeight='normal'
      size='sm'
      style={{fontVariant: 'small-caps'}}
      {...p}
    >
      {children}
    </Heading>
  )
}

// Datasets before 2019 may not have had their total opportunties calculated
const cutoffTimestamp = new Date('2019').valueOf()

const nameIsValid = (n?: string) => typeof n === 'string' && n.length > 0

export default function EditOpportunityDatatset(p) {
  const dispatch = useDispatch<any>()
  const {createdAt, totalOpportunities} = p.opportunityDataset

  function _editName(newName: string) {
    return dispatch(
      editOpportunityDataset({
        ...p.opportunityDataset,
        name: newName
      })
    )
  }

  function _deleteDataset() {
    return dispatch(deleteOpportunityDataset(p.opportunityDataset))
  }

  function _deleteSourceSet() {
    return dispatch(deleteSourceSet(p.opportunityDataset.sourceId))
  }

  async function _downloadTiff() {
    const value = await dispatch(
      downloadOpportunityDataset(p.opportunityDataset, 'tiff')
    )
    window.open(value.url)
  }

  async function _downloadGrid() {
    const value = await dispatch(
      downloadOpportunityDataset(p.opportunityDataset, 'grid')
    )
    window.open(value.url)
  }

  return (
    <Stack spacing={5}>
      <Stack spacing={0}>
        <LabelHeading>{message('spatialDatasets.name')}</LabelHeading>
        <Heading size='md'>
          <Editable
            onChange={_editName}
            isValid={nameIsValid}
            placeholder='Spatial dataset name'
            value={p.opportunityDataset.name}
          />
        </Heading>
      </Stack>

      <Stack>
        <LabelHeading>format</LabelHeading>
        <Heading id='format' size='md'>
          {p.opportunityDataset.format}
        </Heading>
      </Stack>

      {(totalOpportunities || createdAt >= cutoffTimestamp) && (
        <Stack spacing={1}>
          <LabelHeading>total opportunities</LabelHeading>
          <Heading id='totalOpportunities' size='md'>
            {totalOpportunities.toLocaleString()}
          </Heading>
        </Stack>
      )}

      <Stack spacing={1}>
        <LabelHeading>download as</LabelHeading>
        <ButtonGroup>
          <Button
            leftIcon={<DownloadIcon />}
            onClick={_downloadTiff}
            title={message('spatialDatasets.downloadTiff')}
            colorScheme='green'
            variant='outline'
          >
            .tiff
          </Button>
          <Button
            leftIcon={<DownloadIcon />}
            onClick={_downloadGrid}
            title={message('spatialDatasets.downloadGrid')}
            colorScheme='green'
            variant='outline'
          >
            .grid
          </Button>
        </ButtonGroup>
      </Stack>

      <Stack spacing={1}>
        <LabelHeading>created by</LabelHeading>
        <Heading size='md'>{p.opportunityDataset.createdBy}</Heading>
      </Stack>

      <Stack spacing={1}>
        <LabelHeading>created at</LabelHeading>
        <Heading size='md'>{new Date(createdAt).toLocaleString()}</Heading>
      </Stack>

      <ConfirmButton
        description={message('spatialDatasets.confirmDelete')}
        leftIcon={<DeleteIcon />}
        onConfirm={_deleteDataset}
        colorScheme='red'
        variant='outline'
      >
        {message('spatialDatasets.delete')}
      </ConfirmButton>

      <Divider />

      <Stack spacing={2}>
        <LabelHeading>{message('spatialDatasets.sourceName')}</LabelHeading>
        <Heading size='md'>{p.opportunityDataset.sourceName}</Heading>
      </Stack>

      <ConfirmButton
        description={message('spatialDatasets.confirmDeleteSource')}
        leftIcon={<DeleteIcon />}
        onConfirm={_deleteSourceSet}
        colorScheme='red'
        variant='outline'
      >
        {message('spatialDatasets.deleteSource')}
      </ConfirmButton>
    </Stack>
  )
}
