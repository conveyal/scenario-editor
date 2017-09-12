/** Create a grid by uploading files */

import Icon from '@conveyal/woonerf/components/icon'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import ReactTooltip from 'react-tooltip'

import {File, Text} from './input'
import {Body, Heading, Panel} from './panel'
import messages from '../utils/messages'

export default class CreateGrid extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    fetch: PropTypes.func.isRequired,
    finish: PropTypes.func.isRequired
  }

  state = {
    uploading: false,
    csv: false,
    id: null
  }

  render () {
    const {uploading} = this.state

    return (
      <Panel>
        <Heading>
          {messages.analysis.createGrid}
          <a data-tip='React-tooltip'>
          <Icon className='fa-question-circle-o fa-lg pull-right' / >
          </a>
          <ReactTooltip className='help-tooltip' place='right'>
            {messages.analysis.createGridTooltip}
          </ReactTooltip>
        </Heading>
        {uploading ? <Uploading /> : this.renderForm()}
      </Panel>
    )
  }

  onSubmit = e => {
    e.preventDefault()
    const {fetch, finish, projectId} = this.props
    const body = new window.FormData(e.target)
    this.setState({...this.state, uploading: true})

    fetch({
      url: `/api/grid/${projectId}`,
      options: {
        body,
        method: 'post'
      },
      next (error, response) {
        if (error) {
          window.alert(error)
          console.error(error)
        } else {
          finish(projectId)
        }
      }
    })
  }

  setFiles = e => {
    const files = e.target.files
    // signal if it's a CSV file; if so, we need to show extra fields
    // if it's a shapefile, this is not needed
    const csv =
      files.length === 1 && files[0].name.toLowerCase().endsWith('.csv')
    this.setState({...this.state, files, csv})
  }

  renderForm () {
    const {csv, files, name, uploading} = this.state

    return (
      <Body>
        <form
          onSubmit={this.onSubmit}
          method='post'
          encType='multipart/form-data'
        >
          <Text
            name='Name'
            label={messages.analysis.gridName}
            placeholder={messages.analysis.gridName}
            value={name}
            onChange={e => this.setState({...this.state, name: e.target.value})}
          />

          <File
            multiple
            label={messages.analysis.gridFiles}
            name='files'
            onChange={this.setFiles}
          />

          {csv && this.renderCsvFields()}

          <input
            className='btn btn-block btn-success'
            disabled={uploading || !name || !files}
            type='submit'
            value={messages.analysis.createGrid}
          />
        </form>
      </Body>
    )
  }

  /** CSV files don't have standard lat and lon column names, so make the user specify them */
  renderCsvFields () {
    const {latField, lonField} = this.state
    return (
      <span>
        <Text
          name='latField'
          label={messages.analysis.latField}
          placeholder={messages.analysis.latField}
          value={latField}
          onChange={e =>
            this.setState({...this.state, latField: e.target.value})}
        />

        <Text
          name='lonField'
          label={messages.analysis.lonField}
          placeholder={messages.analysis.lonField}
          value={lonField}
          onChange={e =>
            this.setState({...this.state, lonField: e.target.value})}
        />
      </span>
    )
  }
}

function Uploading () {
  return (
    <Body>
      <Icon type='spinner' className='fa-spin pull-left' />
      {messages.analysis.uploading}
    </Body>
  )
}
