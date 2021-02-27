import {Box, Button, Heading, Stack} from '@chakra-ui/react'
import differenceInHours from 'date-fns/differenceInHours'
import Link from 'next/link'
import {useDispatch, useSelector} from 'react-redux'

import {AddIcon} from 'lib/components/icons'
import useInterval from 'lib/hooks/use-interval'
import message from 'lib/message'
import {toHref} from 'lib/router'

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
        <Link href={toHref('opportunitiesUpload', {regionId})} passHref>
          <Button leftIcon={<AddIcon />} colorScheme='green'>
            {message('spatialDatasets.upload')}
          </Button>
        </Link>
        <Button onClick={_downloadLODES} colorScheme='blue'>
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
