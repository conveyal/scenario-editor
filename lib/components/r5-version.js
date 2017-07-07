// @flow
import React, {Component, PropTypes} from 'react'
import Select from 'react-select'

import Icon from './icon'
import messages from '../utils/messages'
import {Group} from './input'
import {RELEASE_VERSION_REGEX} from '../utils/r5-version'

type Props = {
  allVersions: string[],
  label: string,
  name: string,
  releaseVersions: string[],
  value: string,

  onChange: PropTypes.func.isRequired
}

type State = {
  showAllVersions: boolean
}

/**
 * Select an R5 version, based on what is available in S3
 */
export default class R5Version extends Component<void, Props, State> {
  state = {
    showAllVersions: !RELEASE_VERSION_REGEX.test(this.props.value)
  }

  toggleAllVersions = () => {
    const { value } = this.props
    const {showAllVersions} = this.state

    // don't allow turning off the flask when a non-release version is selected
    if (RELEASE_VERSION_REGEX.test(value) || !showAllVersions) {
      this.setState({showAllVersions: !this.state.showAllVersions})
    }
  }

  render () {
    const {showAllVersions} = this.state
    const {releaseVersions, allVersions, value, ...rest} = this.props

    const versions = showAllVersions ? allVersions : releaseVersions
    const options = versions.map(v => {
      return {
        value: v,
        label: v
      }
    })

    // if this project has an older version that is no longer supported, show it but strike it through
    if (!versions.includes(value)) {
      options.push({
        value,
        label: <span style={{ textDecoration: 'line-through' }}>
          {value}
        </span>
      })
    }

    // versions are in reverse-chronological order
    // nb if a non-release version is selected, this will show the message iff there is a more recent
    // release version available
    const latestReleaseVersionSelected = value && value.startsWith(releaseVersions[0])

    return <div>
      <Group {...this.props}>
        <Icon
          type='flask'
          style={{
            color: showAllVersions ? '#000' : '#aaa',
            cursor: 'pointer'
          }}
          title={showAllVersions ? messages.project.showReleaseVersions : messages.project.showAllVersions}
          aria-label={showAllVersions ? messages.project.showReleaseVersions : messages.project.showAllVersions}
          onClick={this.toggleAllVersions}
          />

        <Select
          options={options}
          value={value}
          clearable={false}
          {...rest}
          />
      </Group>

      {!latestReleaseVersionSelected && <div className='alert alert-warning'>
        {messages.project.latestReleaseVersionNotSelected}
      </div>}
    </div>
  }
}
