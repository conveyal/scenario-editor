// @flow
import message from '@conveyal/woonerf/message'
import Icon from '@conveyal/woonerf/components/icon'
import differenceInHours from 'date-fns/difference_in_hours'
import distanceInWords from 'date-fns/distance_in_words_to_now'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'

import {Button} from '../../../components/buttons'
import {Group} from '../../../components/input'
import * as actions from '../actions'
import * as select from '../selectors'
import type {OpportunityDataset, UploadStatus} from '../types'

import Selector from './selector'
import EditOpportunityDataset from './edit'

const UPLOAD_STATUS_CHECK_INTERVAL = 5000 // five seconds

const isErrorOrDone = (status) => status === 'ERROR' || status === 'DONE'
function statusToStyle (status): string {
  switch (status) {
    case 'ERROR': return 'danger'
    case 'UPLOADING':
    case 'PROCESSING': return 'info'
    case 'DONE': return 'success'
    default: return 'warning'
  }
}

type Props = {
  activeOpportunityDataset?: OpportunityDataset,
  checkUploadStatus: () => void,

  clearStatus: (statusId: string) => void,
  deleteOpportunityDataset: (dataset: OpportunityDataset) => void,
  deleteSourceSet: (sourceId: string) => void,
  downloadLODES: () => void,
  downloadOpportunityDataset: (dataset: OpportunityDataset, format: string) => void,
  editOpportunityDataset: (dataset: OpportunityDataset) => void,
  goToUpload: () => void,
  uploadStatuses: UploadStatus[]
}

type State = {
  uploadStatuses: UploadStatus[]
}

export class ListOpportunityDatasets extends PureComponent<Props, State> {
  state = {
    uploadStatuses: this.props.uploadStatuses
  }

  _uploadStatusInterval: number
  componentDidMount () {
    this._uploadStatusInterval = setInterval(() => {
      if (this.props.uploadStatuses.find((status) => !isErrorOrDone(status.status))) {
        this.props.checkUploadStatus()
      }
    }, UPLOAD_STATUS_CHECK_INTERVAL)
  }

  componentWillUnmount () {
    clearInterval(this._uploadStatusInterval)
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({
      uploadStatuses: nextProps.uploadStatuses
    })
  }

  _clearStatus = memoize((statusId) => () => {
    this.setState({
      uploadStatuses: this.state.uploadStatuses.filter((s) => s.id !== statusId)
    })
    this.props.clearStatus(statusId)
  })

  _downloadLODES = () => this.props.downloadLODES()

  render () {
    const {activeOpportunityDataset, goToUpload} = this.props
    const {uploadStatuses} = this.state
    return <div>
      {uploadStatuses.length > 0 && <h5>Upload Status</h5>}
      {uploadStatuses
        .filter((status) => differenceInHours(status.completedAt || status.createdAt, new Date()) < 24)
        .map((status, i) =>
          <Status
            clear={this._clearStatus(status.id)}
            key={`us-${i}`}
            {...status}
          />)}
      <Group>
        <Button
          block
          onClick={goToUpload}
          style='success'
          title={message('opportunityDatasets.upload')}
        ><Icon type='plus' /> {message('opportunityDatasets.upload')}
        </Button>
        <Button
          block
          onClick={this._downloadLODES}
          style='primary'
          title={message('opportunityDatasets.downloadLODES')}
        ><Icon type='users' /> {message('opportunityDatasets.downloadLODES')}
        </Button>
      </Group>
      <p className='center'>{message('opportunityDatasets.select')}</p>
      <Group>
        <Selector />
      </Group>
      {activeOpportunityDataset &&
        <EditOpportunityDataset {...this.props} />}
    </div>
  }
}

const Status = (status: UploadStatus & {clear: () => void}) =>
  <div className={`alert alert-${statusToStyle(status.status)}`}>
    {isErrorOrDone(status.status) &&
      <button
        className='close'
        onClick={status.clear}
        type='button'>&times;</button>}
    <p><strong>{status.name} ({status.status})</strong></p>
    {status.status === 'DONE' &&
      <p>
        {message('opportunityDatasets.finishedUploading', {
          total: `${status.totalGrids}`,
          completedAt: distanceInWords(status.completedAt)
        })}
        <a
          onClick={() => { status.clear(); window.location.reload(true) }}
          tabIndex={0}
        > {message('opportunityDatasets.reloadPage')}</a>
      </p>}
    {status.status === 'UPLOADING' &&
      <p>
        {message('opportunityDatasets.uploadProgress', {
          createdAt: distanceInWords(status.createdAt),
          completed: `${status.uploadedGrids}`,
          total: `${status.totalGrids}`
        })}
      </p>}
    {status.message && status.message.length > 0 && <p>{status.message}</p>}
  </div>

export default connect(createStructuredSelector(select), {
  ...actions,
  goToUpload: () => actions.goTo('/upload')
})(ListOpportunityDatasets)
