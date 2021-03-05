import {Button, Checkbox, Stack} from '@chakra-ui/react'
import {color as parseColor} from 'd3-color'
import get from 'lodash/get'
import {useSelector} from 'react-redux'

import {AddIcon} from 'lib/components/icons'
import colors from 'lib/constants/colors'
import selectFeedsWithBundleNames from 'lib/selectors/feeds-with-bundle-names'
import selectFeedScopedModificationStops from 'lib/selectors/feed-scoped-modification-stops'
import selectFrequencyEntryPatterns from 'lib/selectors/frequency-entry-patterns'
import selectModificationFeed from 'lib/selectors/modification-feed'
import selectRoutePatterns from 'lib/selectors/route-patterns'
import {create as createFrequencyEntry} from 'lib/utils/frequency-entry'

import DirectionalMarkers from '../directional-markers'
import PatternGeometry from '../map/geojson-patterns'

import SelectFeedAndRoutes from './select-feed-and-routes'
import FrequencyEntry from './frequency-entry'

// Parsed color as string
const MAP_COLOR = parseColor(colors.MODIFIED) + ''

/**
 * Convert a route to a frequency-based representation, and adjust the frequency
 *
 * @author mattwigway
 */
export default function ConvertToFrequency({
  modification,
  update,
  updateAndRetrieveFeedData
}) {
  const feeds = useSelector(selectFeedsWithBundleNames)
  const feedScopedModificationStops = useSelector(
    selectFeedScopedModificationStops
  )
  const routePatterns = useSelector(selectRoutePatterns)
  const selectedFeed = useSelector(selectModificationFeed)
  const selectedPatterns = useSelector(selectFrequencyEntryPatterns)

  const _onRouteChange = ({feed, routes}) => {
    updateAndRetrieveFeedData({
      entries: (modification.entries || []).map((entry) => ({
        ...entry,
        sourceTrip: null,
        patternTrips: []
      })),
      feed,
      routes
    })
  }

  const _replaceEntry = (index) => (newEntryProps) => {
    const entries = [...(modification.entries || [])]
    entries[index] = {
      ...entries[index],
      ...newEntryProps
    }
    update({entries})
  }

  const _removeEntry = (index) => () => {
    const entries = [...(modification.entries || [])]
    entries.splice(index, 1)
    update({entries})
  }

  const _newEntry = () => {
    const entries = get(modification, 'entries', [])
    const newEntry = createFrequencyEntry(entries.length)
    update({entries: [...entries, newEntry]})
  }

  const _setRetainTripsOutsideFrequencyEntries = (e) => {
    update({
      retainTripsOutsideFrequencyEntries: e.currentTarget.checked
    })
  }

  return (
    <Stack spacing={4}>
      <PatternGeometry color={MAP_COLOR} patterns={selectedPatterns} />
      <DirectionalMarkers color={MAP_COLOR} patterns={selectedPatterns} />

      <SelectFeedAndRoutes
        feeds={feeds}
        onChange={_onRouteChange}
        selectedFeed={selectedFeed}
        selectedRouteIds={modification.routes}
      />

      <Checkbox
        fontWeight='normal'
        onChange={_setRetainTripsOutsideFrequencyEntries}
        value={modification.retainTripsOutsideFrequencyEntries}
      >
        Retain existing scheduled trips at times without new frequencies
        specified
      </Checkbox>

      {modification.routes && modification.routes.length > 0 && (
        <Button
          isFullWidth
          leftIcon={<AddIcon />}
          onClick={_newEntry}
          colorScheme='green'
        >
          Add frequency entry
        </Button>
      )}

      {selectedFeed &&
        get(modification, 'entries', []).map((entry, eidx) => (
          <FrequencyEntry
            entry={entry}
            feed={selectedFeed}
            key={eidx}
            modificationStops={feedScopedModificationStops}
            remove={_removeEntry(eidx)}
            routePatterns={routePatterns}
            routes={modification.routes}
            update={_replaceEntry(eidx)}
          />
        ))}
    </Stack>
  )
}
