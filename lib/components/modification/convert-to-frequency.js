import {faPlus} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import React from 'react'

import {create as createFrequencyEntry} from 'lib/utils/frequency-entry'

import {Button} from '../buttons'
import Icon from '../icon'
import {Checkbox} from '../input'
import P from '../p'

import SelectFeedAndRoutes from './select-feed-and-routes'
import FrequencyEntry from './frequency-entry'

/**
 * Convert a route to a frequency-based representation, and adjust the frequency
 *
 * @author mattwigway
 */
export default class ConvertToFrequency extends React.Component {
  onRouteChange = ({feed, routes}) => {
    const {modification, updateAndRetrieveFeedData} = this.props
    updateAndRetrieveFeedData({
      entries: (modification.entries || []).map(entry => ({
        ...entry,
        sourceTrip: null,
        patternTrips: []
      })),
      feed,
      routes
    })
  }

  replaceEntry = index => newEntryProps => {
    const {modification, update} = this.props
    const entries = [...(modification.entries || [])]
    entries[index] = {
      ...entries[index],
      ...newEntryProps
    }
    update({entries})
  }

  removeEntry = index => () => {
    const {modification, update} = this.props
    const entries = [...(modification.entries || [])]
    entries.splice(index, 1)
    update({entries})
  }

  newEntry = () => {
    const p = this.props
    const entries = get(p, 'modification.entries', [])
    const newEntry = createFrequencyEntry(entries.length)
    p.update({entries: [...entries, newEntry]})
  }

  setRetainTripsOutsideFrequencyEntries = e => {
    this.props.update({
      retainTripsOutsideFrequencyEntries: e.currentTarget.checked
    })
  }

  setActiveTrips = activeTrips => {
    this.props.setMapState({
      ...this.props.mapState,
      activeTrips
    })
  }

  render() {
    const p = this.props
    const {
      feeds,
      feedScopedModificationStops,
      modification,
      routePatterns,
      projectTimetables,
      selectedFeed
    } = this.props
    return (
      <>
        <SelectFeedAndRoutes
          feeds={feeds}
          onChange={this.onRouteChange}
          selectedFeed={selectedFeed}
          selectedRouteIds={modification.routes}
        />

        <Checkbox
          label='Retain existing scheduled trips at times without new frequencies specified'
          onChange={this.setRetainTripsOutsideFrequencyEntries}
          checked={modification.retainTripsOutsideFrequencyEntries}
        />

        {modification.routes && modification.routes.length > 0 && (
          <P>
            <Button block style='success' onClick={this.newEntry}>
              <Icon icon={faPlus} /> Add frequency entry
            </Button>
          </P>
        )}

        {selectedFeed &&
          get(p, 'modification.routes.length') > 0 &&
          get(p, 'modification.entries', []).map((entry, eidx) => (
            <FrequencyEntry
              entry={entry}
              feed={selectedFeed}
              index={eidx + 1}
              key={eidx}
              modificationStops={feedScopedModificationStops}
              remove={this.removeEntry(eidx)}
              routePatterns={routePatterns}
              routes={modification.routes}
              projectTimetables={projectTimetables}
              setActiveTrips={this.setActiveTrips}
              update={this.replaceEntry(eidx)}
            />
          ))}
      </>
    )
  }
}
