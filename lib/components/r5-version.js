/** Select an R5 version, based on what is available in S3 */

import React, {Component, PropTypes} from 'react'
import Select from 'react-select'

import {IconToggle} from './buttons'
import messages from '../utils/messages'
import {Group} from './input'

const R5_BUCKET = 'https://r5-builds.s3.amazonaws.com'
const RELEASE_VERSION_REGEX = /^v[0-9]+\.[0-9]+\.[0-9]+$/
const VERSION_PARSE_REGEX = /^v([0-9]+).([0-9]+).([0-9]+)-?([0-9]+)?-?(.*)?$/

export default class R5Version extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,

    fetch: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
  }

  state = {
    allVersions: [],
    releaseVersions: [],
    showAllVersions: false
  }

  componentDidMount () {
    if (process.env.NODE_ENV !== 'test') this.fetchVersions()
  }

  fetchVersions () {
    const {fetch} = this.props
    // retrieve R5 versions from S3
    fetch({
      url: R5_BUCKET,
      options: {
        headers: {
          Authorization: ''
        }
      },
      next: (error, response) => {
        if (error) window.alert(error)
        else this.setVersionsFromXML(response.value)
      }
    })
  }

  setVersionsFromXML (text) {
    const {onChange, value} = this.props
    const parser = new window.DOMParser()
    const r5doc = parser.parseFromString(text, 'application/xml')

    const listing = Array.from(r5doc.querySelectorAll('Contents'))
      .map((item) => item.querySelector('Key').childNodes[0].nodeValue) // get just key
      .filter((item) => item !== 'index.html') // don't include the main page
      .map((item) => item.replace(/.jar$/, '')) // and remove .jar

    listing.sort(sortR5Versions)

    const releaseVersions = listing
      .filter(i => RELEASE_VERSION_REGEX.test(i))

    // if no version selected, force choosing latest version.
    if (value == null) onChange({ value: releaseVersions[0] })

    // if the version selected is not a release version, show all versions
    const showAllVersions = releaseVersions.indexOf(this.props.value) === -1 && listing.indexOf(this.props.value) > -1

    this.setState({...this.state, allVersions: listing, releaseVersions, showAllVersions})
  }

  toggleAllVersions = () => {
    this.setState({...this.state, showAllVersions: !this.state.showAllVersions})
  }

  render () {
    const {releaseVersions, allVersions, showAllVersions} = this.state
    const {value, ...rest} = this.props

    return <div>
      <Group {...this.props}>
        <IconToggle
          checked={showAllVersions}
          checkedTooltip={messages.project.showReleaseVersions}
          uncheckedTooltip={messages.project.showAllVersions}
          icon='flask'
          onChange={this.toggleAllVersions}
        />

        <Select
          options={(showAllVersions ? allVersions : releaseVersions).map(v => ({ value: v, label: v }))}
          value={value}
          clearable={false}
          {...rest}
          />
      </Group>
    </div>
  }
}

function sortR5Versions (a, b) {
  const [, amajor, aminor, apatch, acommit] = a.match(VERSION_PARSE_REGEX)
  const [, bmajor, bminor, bpatch, bcommit] = b.match(VERSION_PARSE_REGEX)

  const intDiff = (a, b) => parseInt(a) - parseInt(b)

  // reverse-sort, most recent at top
  const diffs = [intDiff(amajor, bmajor), intDiff(aminor, bminor), intDiff(apatch, bpatch)]
  for (const diff of diffs) {
    if (diff !== 0) return diff < 0 ? 1 : -1
  }

  // commit versions go above their release versions to keep chronology
  if (acommit == null && bcommit == null) return 0
  if (acommit == null) return 1
  if (bcommit == null) return -1

  const commitDiff = intDiff(acommit, bcommit)
  if (commitDiff < 0) return 1
  else if (commitDiff > 0) return -1

  return 0 // this should not happen, no two versions should be identical
}
