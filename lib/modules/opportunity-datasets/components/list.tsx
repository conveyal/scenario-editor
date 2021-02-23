import {Box, Button, Heading, Stack} from '@chakra-ui/core'
import differenceInHours from 'date-fns/differenceInHours'
import {useDispatch, useSelector} from 'react-redux'

import ButtonLink from 'lib/components/button-link'
import useInterval from 'lib/hooks/use-interval'
import message from 'lib/message'

import {
  checkUploadStatus,
  clearStatus,
  downloadLODES,
  loadOpportunityDatasets
} from '../actions'
import * as select from '../selectors'

import EditOpportunityDataset from './edit'
import Selector from './selector'
import Status from './status'

const uploadingOrProcessing = (s) => ['UPLOADING', 'PROCESSING'].includes(s)
const UPLOAD_STATUS_CHECK_INTERVAL = 5000 // five seconds

export default function ListOpportunityDatasets({regionId}) {
  const dispatch = useDispatch<any>()
  const activeOpportunityDataset = useSelector(select.activeOpportunityDataset)
  const uploadStatuses = useSelector(select.uploadStatuses)

  // If there are uploads occuring, check statuses on an interval
  useInterval(async () => {
    if (uploadStatuses.find((status) => uploadingOrProcessing(status.status))) {
      const newStatuses = await dispatch(checkUploadStatus(regionId))
      // Reload ODs if any status went from processing to done
      const incomplete = uploadStatuses.filter((s) => s.status !== 'DONE')
      const complete = newStatuses.filter((s) => s.status === 'DONE')

      if (
        complete.findIndex((s) => incomplete.find((i) => i.id === s.id)) > -1
      ) {
        dispatch(loadOpportunityDatasets(regionId))
      }
    }
  }, UPLOAD_STATUS_CHECK_INTERVAL)

  function _downloadLODES() {
    if (window.confirm(message('spatialDatasets.confirmLODES'))) {
      dispatch(downloadLODES(regionId))
    }
  }

  const recentStatuses = uploadStatuses.filter(
    (status) =>
      differenceInHours(status.completedAt || status.createdAt, new Date()) < 24
  )

  return (
    <Stack spacing={5}>
      {recentStatuses.length > 0 && <Heading size='sm'>Upload Status</Heading>}
      {recentStatuses.map((status, i) => (
        <Status
          clear={() => dispatch(clearStatus(regionId, status.id))}
          key={`us-${i}`}
          {...status}
        />
      ))}
      <Stack spacing={2}>
        <ButtonLink
          leftIcon='small-add'
          to='opportunitiesUpload'
          query={{regionId}}
          variantColor='green'
        >
          {message('spatialDatasets.upload')}
        </ButtonLink>
        <Button onClick={_downloadLODES} variantColor='blue'>
          {message('spatialDatasets.downloadLODES')}
        </Button>
      </Stack>
      <Box textAlign='center'>
        <label htmlFor='select-opportunity-dataset'>
          {message('spatialDatasets.select')}
        </label>
      </Box>
      <Box>
        <Selector regionId={regionId} />
      </Box>
      {activeOpportunityDataset && (
        <EditOpportunityDataset opportunityDataset={activeOpportunityDataset} />
      )}
    </Stack>
  )
}
