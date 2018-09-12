// @flow
import message from '@conveyal/woonerf/message'
import Icon from '@conveyal/woonerf/components/icon'
import React, {PureComponent} from 'react'

import {Button} from '../../../components/buttons'
import {Group} from '../../../components/input'
import type {OpportunityDataset} from '../types'

type Props = {
  activeOpportunityDataset: OpportunityDataset,

  deleteOpportunityDataset: (dataset: OpportunityDataset) => void,
  deleteSourceSet: (sourceId: string) => void,
  downloadOpportunityDataset: (dataset: OpportunityDataset, format: string) => void,
  editOpportunityDataset: (dataset: OpportunityDataset) => void
}

export default class EditOpportunityDatatset extends PureComponent<Props> {
  _editName = () => {
    const {activeOpportunityDataset} = this.props
    const newName = window.prompt(message('opportunityDatasets.enterName'))
    if (newName !== activeOpportunityDataset.name) {
      this.props.editOpportunityDataset({
        ...activeOpportunityDataset,
        name: newName
      })
    }
  }

  _deleteDataset = () => {
    const {activeOpportunityDataset} = this.props
    if (window.confirm(message('opportunityDatasets.confirmDelete'))) {
      this.props.deleteOpportunityDataset(activeOpportunityDataset)
    }
  }

  _deleteSourceSet = () => {
    const {activeOpportunityDataset} = this.props
    if (window.confirm(message('opportunityDatasets.confirmDeleteSource'))) {
      this.props.deleteSourceSet(activeOpportunityDataset.sourceId)
    }
  }

  _downloadTiff = () => {
    const {activeOpportunityDataset} = this.props
    this.props.downloadOpportunityDataset(activeOpportunityDataset, 'tiff')
  }

  _downloadGrid = () => {
    const {activeOpportunityDataset} = this.props
    this.props.downloadOpportunityDataset(activeOpportunityDataset, 'grid')
  }

  render () {
    const {activeOpportunityDataset} = this.props
    return <div>
      <Group label={activeOpportunityDataset.name}>
        <Button
          block
          onClick={this._editName}
          style='warning'
          title={message('opportunityDatasets.editName')}
        ><Icon type='pencil' /> {message('opportunityDatasets.editName')}
        </Button>
        <Button
          block
          onClick={this._deleteDataset}
          style='danger'
          title={message('opportunityDatasets.delete')}
        ><Icon type='trash' /> {message('opportunityDatasets.delete')}
        </Button>
        <Button
          block
          onClick={this._deleteSourceSet}
          style='danger'
          title={message('opportunityDatasets.deleteSource')}
        ><Icon type='trash' /> {message('opportunityDatasets.deleteSource')}
        </Button>
      </Group>
      <Group label={message('analysis.gisExport')}>
        <Button
          block
          onClick={this._downloadTiff}
          style='success'
          title={message('opportunityDatasets.downloadTiff')}
        ><Icon type='download' /> {message('opportunityDatasets.downloadTiff')}
        </Button>
        <Button
          block
          onClick={this._downloadGrid}
          style='success'
          title={message('opportunityDatasets.downloadGrid')}
        ><Icon type='download' /> {message('opportunityDatasets.downloadGrid')}
        </Button>
      </Group>
    </div>
  }
}
