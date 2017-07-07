// @flow
import Icon from '@conveyal/woonerf/components/icon'
import isEqual from 'lodash/isEqual'
import React, {PureComponent} from 'react'
import Select from 'react-select'

import {Group, Text} from '../input'
import {Button} from '../buttons'
import messages from '../../utils/messages'

import type {Bookmark, LonLat, Modification, ProfileRequest} from '../../types'

type Props = {
  bookmarks: Bookmark[],
  bundleId: string,
  isochroneLonLat?: LonLat,
  isFetchingIsochrone: boolean,
  profileRequest: ProfileRequest,
  projectBounds: {},
  projectId: string,
  comparisonInProgress: boolean,
  comparisonScenarioId: string,
  comparisonVariant: number,
  comparisonModifications: Modification[],
  comparisonIsochrone: {},
  comparisonBundleId: string,
  currentIndicator: string,
  isochroneCutoff: number,
  modifications: Modification[],
  scenarioId: string,
  variantIndex: number,
  workerVersion: string,

  createBookmark(): void,
  fetchTravelTimeSurface(): void,
  selectBookmark(Bookmark): void,
  setCurrentIndicator(): void,
  setIsochroneCutoff(): void
}

type State = {
  bookmarkName: string,
  creatingBookmark: boolean
}

export default class BookmarkChooser extends PureComponent<void, Props, State> {
  state = {
    bookmarkName: '',
    creatingBookmark: false
  }

  selectBookmark = (e: {value: string}) => {
    const {
      bookmarks,
      comparisonInProgress,
      comparisonScenarioId,
      comparisonVariant,
      comparisonModifications,
      comparisonBundleId,
      bundleId,
      projectId,
      projectBounds,
      workerVersion,
      modifications,
      scenarioId,
      variantIndex,

      fetchTravelTimeSurface,
      selectBookmark,
      setCurrentIndicator,
      setIsochroneCutoff
    } = this.props

    const bookmark = bookmarks.find(b => b.id === e.value)

    if (bookmark) {
      const {profileRequest, isochroneCutoff, destinationGrid} = bookmark

      const commonParams = {
        workerVersion,
        projectId,
        bundleId,
        profileRequest
      }

      const scenario = {
        ...commonParams,
        scenarioId,
        variantIndex,
        modifications,
        bundleId
      }

      const comparison = !comparisonInProgress ? null
        : {
          ...commonParams,
          scenarioId: comparisonScenarioId,
          variantIndex: comparisonVariant,
          modifications: comparisonModifications,
          bundleId: comparisonBundleId
        }

      fetchTravelTimeSurface({ scenario, comparison, bounds: projectBounds })
      setIsochroneCutoff(isochroneCutoff)
      setCurrentIndicator(projectId, destinationGrid)
      selectBookmark(bookmark)
    }
  }

  prepareCreateBookmark = () =>
    this.setState({ creatingBookmark: true })

  setBookmarkName = (e: Event & {target: HTMLInputElement}) =>
    this.setState({ bookmarkName: e.target.value })

  createBookmark = () => {
    const {bookmarkName} = this.state
    const {currentIndicator, isochroneLonLat, isochroneCutoff, profileRequest, createBookmark, projectId} = this.props

    if (isochroneLonLat) {
      const {lat, lon} = isochroneLonLat

      createBookmark({
        name: bookmarkName,
        profileRequest: {
          ...profileRequest,
          fromLat: lat,
          fromLon: lon
        },
        destinationGrid: currentIndicator,
        isochroneCutoff,
        projectId
      })

      this.setState({ creatingBookmark: false, bookmarkName: '' })
    } else {
      window.alert('Please verify analysis has been successful before creating a bookmark.')
    }
  }

  render () {
    const { creatingBookmark } = this.state
    return creatingBookmark ? this.renderBookmarkCreate() : this.renderBookmarkSelect()
  }

  renderBookmarkSelect () {
    const {bookmarks, profileRequest, isochroneCutoff, isochroneLonLat, isFetchingIsochrone, currentIndicator} = this.props
    const options = bookmarks.sort((a, b) => {
      if (a.name === b.name) return 0
      else if (a.name == null) return -1
      else if (b.name == null) return 1
      else return a.name.localeCompare(b.name)
    }).map(b => ({
      label: b.name,
      value: b.id
    }))

    const selectedBookmark = isochroneLonLat
      ? bookmarks.find((b) =>
          Math.abs(b.profileRequest.fromLon - isochroneLonLat.lon) < 1e-8 &&
          Math.abs(b.profileRequest.fromLat - isochroneLonLat.lat) < 1e-8 &&
          currentIndicator === b.destinationGrid &&
          isochroneCutoff === b.isochroneCutoff &&
          isEqual(b.profileRequest, profileRequest)
        )
      : null

    return <div>
      <Group label={messages.analysis.bookmark}>
        <Select
          options={options}
          disabled={isFetchingIsochrone} // don't allow users to reselect bookmarks while their bookmark is loading
          value={selectedBookmark && selectedBookmark.id}
          onChange={this.selectBookmark}
        />
      </Group>
      <Button onClick={this.prepareCreateBookmark} disabled={isFetchingIsochrone || !isochroneLonLat}>
        <Icon type='plus' />&nbsp;
        {messages.analysis.createBookmark}
      </Button>
    </div>
  }

  renderBookmarkCreate () {
    const {isFetchingIsochrone} = this.props
    const {bookmarkName} = this.state
    return <div>
      <Group label={messages.analysis.bookmarkName}>
        <Text
          value={bookmarkName}
          onChange={this.setBookmarkName}
          placeholder={messages.analysis.bookmarkName}
        />
      </Group>

      {/* it would be confusing to allow the user to create a bookmark during isochrone fetch;
        the bookmarked settings might not correspond to the desired ones */}
      <Button onClick={this.createBookmark} disabled={isFetchingIsochrone}>
        <Icon type='check' />&nbsp;
        {messages.analysis.createBookmark}
      </Button>
    </div>
  }
}
