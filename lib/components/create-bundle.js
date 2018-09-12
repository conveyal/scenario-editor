// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import React, {Component} from 'react'

import type {Bundle} from '../types'

import {File, Text} from './input'

// how often to poll when waiting for a bundle to be read on the server.
const POLL_TIMEOUT_MS = 10000
const STATUS_DONE = 'DONE'
const STATUS_ERROR = 'ERROR'

type Props = {
  addBundle: Bundle => void,

  deleteBundle: () => void,
  fetch: any => void,
  regionId: string,
  saveBundle: Bundle => void
}

export default class CreateBundle extends Component<Props> {
  state = {
    bundleId: null,
    files: undefined,
    name: '',
    uploading: false,
    uploadFailed: false
  }

  _submit = (e: Event) => {
    // don't submit the form
    e.preventDefault()
    const {fetch} = this.props
    const {files, name} = this.state
    if (name && files) {
      fetch({
        url: '/api/bundle',
        options: {
          body: new window.FormData(e.target),
          method: 'post'
        },
        next: (err, response) => {
          if (err) {
            console.error(err)
            console.error(err.stack)
            this.setState({uploading: false, uploadFailed: true})
          } else {
            this.setState({bundleId: response.value._id})
            setTimeout(this._checkUploadState, POLL_TIMEOUT_MS)
          }
        }
      })

      this.setState({uploading: true, uploadFailed: false})
    }
  }

  /** check if the upload has completed */
  _checkUploadState = () => {
    const {addBundle, fetch} = this.props
    if (this.state.bundleId != null) {
      fetch({
        url: `/api/bundle/${this.state.bundleId}`,
        next: (error, response) => {
          if (error) {
            console.error(error, error.stack)
            // this request failing does not imply that the bundle failed to upload
            setTimeout(this._checkUploadState, POLL_TIMEOUT_MS)
          } else if (response.value.status === STATUS_DONE) {
            this.setState({
              files: undefined,
              name: undefined,
              uploading: false,
              uploadFailed: false,
              bundleId: undefined
            })
            addBundle(response.value)
          } else if (response.value.status === STATUS_ERROR) {
            this.setState({uploading: false, uploadFailed: response.value.errorCode})
          } else {
            setTimeout(this._checkUploadState, POLL_TIMEOUT_MS)
          }
        }
      })
    }
  }

  _setName = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({name: e.target.value})
  }

  render () {
    const {regionId} = this.props
    const {files, name, uploadFailed, uploading} = this.state
    return (
      <div>
        <h5>{message('bundle.create')}</h5>
        <form
          encType='multipart/form-data'
          method='post'
          onSubmit={this._submit}
        >
          {uploadFailed &&
            <div className='alert alert-danger'>
              <strong>{message('bundle.failure')}</strong>
              <br />{uploadFailed}
            </div>
          }
          <Text
            label={message('bundle.name')}
            name={message('common.name')}
            onChange={this._setName}
            placeholder='Name'
            value={name}
          />

          <File
            label={message('bundle.files')}
            multiple
            name='files'
            onChange={e => this.setState({files: e.target.value})}
            value={files}
          />

          <input type='hidden' name='regionId' value={regionId} />
          <button
            className='btn btn-block btn-success'
            disabled={uploading || !name || !files}
            type='submit'
          >{uploading
              ? <span><Icon className='fa-spin' type='spinner' />
                {message('common.loading')}</span>
              : <span><Icon type='check' /> {message('common.create')}</span>}
          </button>
        </form>
      </div>
    )
  }
}
