// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import Select from 'react-select'
import {createStructuredSelector} from 'reselect'

import messages from '../../../utils/messages'
import {Group} from '../../../components/input'
import {
  loadR5Versions,
  setCurrentR5Version
} from '../actions'
import {RELEASE_VERSION_REGEX} from '../constants'
import * as select from '../selectors'
import type {ReactSelectResult} from '../../../types'

type Props = {
  allValidVersions: string[],
  analysisVersion?: string,
  currentR5Version: string,
  loadR5Versions: () => void,
  newerVersionIsAvailable: boolean,

  releaseVersions: string[],
  setCurrentR5Version: (version: string) => void
}

type State = {
  showAllVersions: boolean
}

/**
 * Select an R5 version, based on what is available in S3
 */
export class SelectR5Version extends Component<void, Props, State> {
  state = {
    showAllVersions: !RELEASE_VERSION_REGEX.test(this.props.currentR5Version)
  }

  componentDidMount () {
    if (this.props.allValidVersions.length === 0) this.props.loadR5Versions()
  }

  _selectVersion = (result: ReactSelectResult) => {
    this.props.setCurrentR5Version(result.value)
  }

  _toggleAllVersions = () => {
    const {currentR5Version} = this.props
    const {showAllVersions} = this.state

    // don't allow turning off the flask when a non-release version is selected
    if (RELEASE_VERSION_REGEX.test(currentR5Version) || !showAllVersions) {
      this.setState({showAllVersions: !this.state.showAllVersions})
    }
  }

  render () {
    const {showAllVersions} = this.state
    const {
      allValidVersions,
      analysisVersion,
      currentR5Version,
      newerVersionIsAvailable,
      releaseVersions
    } = this.props

    const versions = showAllVersions ? allValidVersions : releaseVersions
    const options = versions.map(v => {
      return {
        value: v,
        label: v
      }
    })

    // if this region has an older version that is no longer supported, show it
    // but strike it through
    if (!allValidVersions.includes(currentR5Version)) {
      options.push({
        value: currentR5Version,
        label: (
          <span style={{textDecoration: 'line-through'}}>
            {currentR5Version}
          </span>
        )
      })
    }

    return (
      <div>
        <Group label={messages.r5Version.title}>
          <Icon
            type='flask'
            style={{
              color: showAllVersions ? '#000' : '#aaa',
              cursor: 'pointer'
            }}
            title={
              showAllVersions
                ? messages.r5Version.showRelease
                : messages.r5Version.showAll
            }
            onClick={this._toggleAllVersions}
          />

          <Select
            clearable={false}
            onChange={this._selectVersion}
            options={options}
            value={currentR5Version}
          />
        </Group>

        {newerVersionIsAvailable &&
          <div className='alert alert-warning'>
            {messages.r5Version.latestReleaseVersionNotSelected}
          </div>}

        {analysisVersion && analysisVersion !== currentR5Version &&
          <div className='alert alert-warning'>
            {messages.r5Version.analysisVersionDifferent}
          </div>}
      </div>
    )
  }
}

export default connect(createStructuredSelector(select), {
  loadR5Versions,
  setCurrentR5Version
})(SelectR5Version)
