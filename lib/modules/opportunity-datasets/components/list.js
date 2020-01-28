import {faPlus, faUsers} from '@fortawesome/free-solid-svg-icons'
import differenceInHours from 'date-fns/differenceInHours'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {Button, ButtonLink} from 'lib/components/buttons'
import H5 from 'lib/components/h5'
import Icon from 'lib/components/icon'
import {Group} from 'lib/components/input'
import P from 'lib/components/p'
import useInterval from 'lib/hooks/use-interval'
import message from 'lib/message'

import {checkUploadStatus, clearStatus, downloadLODES} from '../actions'
import * as select from '../selectors'

import EditOpportunityDataset from './edit'
import Selector from './selector'
import Status from './status'

const uploadingOrProcessing = s => ['UPLOADING', 'PROCESSING'].includes(s)
const UPLOAD_STATUS_CHECK_INTERVAL = 5000 // five seconds

export default function ListOpportunityDatasets() {
  const dispatch = useDispatch()
  const router = useRouter()
  const activeOpportunityDataset = useSelector(select.activeOpportunityDataset)
  const uploadStatuses = useSelector(select.uploadStatuses)
  const {regionId} = router.query

  // If there are uploads occuring, check statuses on an interval
  useInterval(() => {
    if (uploadStatuses.find(status => uploadingOrProcessing(status.status))) {
      dispatch(checkUploadStatus(regionId))
    }
  }, UPLOAD_STATUS_CHECK_INTERVAL)

  function _clearStatus(statusId) {
    return dispatch(clearStatus(statusId))
  }

  function _downloadLODES() {
    if (window.confirm(message('opportunityDatasets.confirmLODES'))) {
      dispatch(downloadLODES(regionId))
    }
  }

  const recentStatuses = uploadStatuses.filter(
    status =>
      differenceInHours(status.completedAt || status.createdAt, new Date()) < 24
  )

  return (
    <>
      {recentStatuses.length > 0 && <H5>Upload Status</H5>}
      {recentStatuses.map((status, i) => (
        <Status
          clear={() => _clearStatus(status.id)}
          key={`us-${i}`}
          {...status}
        />
      ))}
      <Group>
        <ButtonLink
          to='opportunitiesUpload'
          regionId={regionId}
          block
          style='success'
        >
          <Icon icon={faPlus} /> {message('opportunityDatasets.upload')}
        </ButtonLink>
        <Button block onClick={_downloadLODES} style='primary'>
          <Icon icon={faUsers} /> {message('opportunityDatasets.downloadLODES')}
        </Button>
      </Group>
      <P className='text-center'>{message('opportunityDatasets.select')}</P>
      <Group>
        <Selector regionId={regionId} />
      </Group>
      {activeOpportunityDataset && (
        <EditOpportunityDataset opportunityDataset={activeOpportunityDataset} />
      )}
    </>
  )
}
