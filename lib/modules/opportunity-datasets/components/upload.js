// @flow
import message from '@conveyal/woonerf/message'
import Icon from '@conveyal/woonerf/components/icon'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

import {Button} from '../../../components/buttons'
import {File, Text} from '../../../components/input'
import {uploadOpportunityDataset} from '../actions'

/** Create an opportunity dataset by uploading files */
export class UploadOpportunityDataset extends PureComponent<Props, State> {
  props: {
    uploadOpportunityDataset: (body: FormData) => void
  }

  state: {
    csv: boolean,
    files: void | FileList,
    name: void | string
  }

  form: HTMLFormElement

  state = {
    files: undefined,
    csv: false,
    latField: null,
    lonField: null,
    name: null,
    uploading: false
  }

  _submit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const body = new window.FormData(this.form)
    this.setState({uploading: true})
    this.props.uploadOpportunityDataset(body)
  }

  _setFiles = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const files = e.target.files
    // signal if it's a CSV file; if so, we need to show extra fields
    // if it's a shapefile, this is not needed
    const csv =
      files.length === 1 && files[0].name.toLowerCase().endsWith('.csv')
    this.setState({files, csv})
  }

  _setStateFromTargetValue = memoize((name) =>
    (e: SyntheticInputEvent<HTMLInputElement>) =>
      this.setState({[name]: e.target.value}))

  render () {
    const {csv, files, latField, lonField, name, uploading} = this.state

    return (
      <div>
        <h5>{message('analysis.createGrid')}</h5>
        <p>{message('analysis.createGridTooltip')}</p>
        <form
          encType='multipart/form-data'
          ref={(form) => { this.form = form }}
        >
          <Text
            name='Name'
            label={`${message('analysis.gridName')}*`}
            value={name}
            onChange={this._setStateFromTargetValue('name')}
          />

          <File
            multiple
            label={`${message('analysis.gridFiles')}*`}
            name='files'
            onChange={this._setFiles}
          />

          {csv &&
            <span>
              <Text
                name='latField'
                label={message('analysis.latField')}
                value={latField}
                onChange={this._setStateFromTargetValue('latField')}
              />

              <Text
                name='lonField'
                label={message('analysis.lonField')}
                value={lonField}
                onChange={this._setStateFromTargetValue('lonField')}
              />
            </span>}

          <Button
            className='btn btn-block btn-success'
            disabled={uploading || !name || !files}
            onClick={this._submit}
            type='success'
          >{uploading
              ? <span>
                <Icon type='spinner' className='fa-spin' /> {message('analysis.uploading')}
              </span>
              : <span><Icon type='plus' /> {message('analysis.createGrid')}</span>}
          </Button>
        </form>
      </div>
    )
  }
}

export default connect(null, {
  uploadOpportunityDataset
})(UploadOpportunityDataset)
