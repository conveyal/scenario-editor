import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import PropTypes from 'prop-types'
import React from 'react'
import ReactTooltip from 'react-tooltip'

import {Button} from './buttons'
import {Body, Heading, Panel} from './panel'
import {File, Text} from './input'
import messages from '../utils/messages'

// how often to poll when waiting for a bundle to be read on the server.
const POLL_TIMEOUT_MS = 1000
const STATUS_DONE = 'DONE'

export default class EditBundle extends Pure {
  static propTypes = {
    bundle: PropTypes.object,
    bundleId: PropTypes.string,
    name: PropTypes.string,
    projectId: PropTypes.string.isRequired,

    addBundle: PropTypes.func.isRequired,
    deleteBundle: PropTypes.func.isRequired,
    fetch: PropTypes.func.isRequired,
    saveBundle: PropTypes.func.isRequired
  }

  state = {
    files: undefined,
    name: this.props.name,
    updloading: false,
    uploadFailed: false,
    bundleId: null
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      ...this.state,
      name: nextProps.name
    })
  }

  _submit = e => {
    // don't submit the form
    e.preventDefault()
    const {bundle, fetch, saveBundle} = this.props
    const {files, name} = this.state
    if (bundle && name) {
      bundle.name = name
      saveBundle(bundle)
    } else if (name && files) {
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
            this.setState({...this.state, uploading: false, uploadFailed: true})
          } else {
            this.setState({...this.state, bundleId: response.value.id})
            setTimeout(this._checkUploadState, POLL_TIMEOUT_MS)
          }
        }
      })

      this.setState({...this.state, uploading: true, uploadFailed: false})
    }
  }

  /** check if the upload has completed */
  _checkUploadState = () => {
    const {addBundle, fetch} = this.props
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
        } else {
          setTimeout(this._checkUploadState, POLL_TIMEOUT_MS)
        }
      }
    })
  }

  _deleteBundle = () => {
    if (window.confirm(messages.bundle.deleteConfirmation)) {
      this.props.deleteBundle()
    }
  }

  _setName = e => {
    this.setState({...this.state, name: e.target.value})
  }

  render () {
    const {bundleId, projectId} = this.props
    const {files, name, uploadFailed, uploading} = this.state
    return (
      <Panel>
        <Heading>
          {bundleId ? messages.bundle.edit : messages.bundle.create}
          <a data-tip='React-tooltip'>
          <Icon className='fa-question-circle-o fa-lg pull-right' / >
          </a>
          <ReactTooltip className='help-tooltip' place='right'>
            {messages.bundle.createBundleTooltip}
          </ReactTooltip>
        </Heading>
        <Body>
          <form
            encType='multipart/form-data'
            method='post'
            onSubmit={this._submit}
          >
            {uploadFailed &&
              <div className='alert alert-danger'>Upload failed</div>}

            <Text
              name='Name'
              onChange={this._setName}
              placeholder='Bundle name'
              value={name}
            />

            {!bundleId &&
              <File
                label='GTFS files'
                multiple
                name='files'
                onChange={e =>
                  this.setState({...this.state, files: e.target.value})}
                value={files}
              />}

            <input type='hidden' name='projectId' value={projectId} />
            <input
              className='btn btn-block btn-success'
              disabled={uploading || !name || (!bundleId && !files)}
              type='submit'
              value={bundleId ? messages.bundle.edit : messages.bundle.create}
            />
            {bundleId &&
              <Button block style='danger' onClick={this._deleteBundle}>
                <Icon type='trash' /> {messages.bundle.delete}
              </Button>}
            {uploading &&
              <span>
                <Icon className='fa-spin' type='spinner' />{' '}
                {bundleId ? 'Uploading' : 'Processing'}&hellip;
              </span>}
          </form>
        </Body>
      </Panel>
    )
  }
}
