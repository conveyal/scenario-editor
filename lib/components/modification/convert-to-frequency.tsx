import {Box, Button, Checkbox, Stack} from '@chakra-ui/react'
import {color as parseColor} from 'd3-color'
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import {useMemo} from 'react'

import {AddIcon} from 'lib/components/icons'
import colors from 'lib/constants/colors'
import {useRoutePatterns, useRouteStops} from 'lib/gtfs/hooks'
import {create as createFrequencyEntry} from 'lib/utils/frequency-entry'
import intersects from 'lib/utils/arrays-intersect'

import DirectionalMarkers from '../directional-markers'
import PatternGeometry from '../map/geojson-patterns'

import SelectFeedAndRoutes from './select-feed-and-routes'
import FrequencyEntry from './frequency-entry'
import useRouteTrips from 'lib/gtfs/hooks/use-route-trips'

// Parsed color as string
const MAP_COLOR = parseColor(colors.MODIFIED) + ''

/**
 * Convert a route to a frequency-based representation, and adjust the frequency
 *
 * @author mattwigway
 */
export default function ConvertToFrequency({
  bundle,
  modification,
  update
}: {
  bundle: CL.Bundle
  modification: CL.ConvertToFrequency
  update: (updates: Partial<CL.ConvertToFrequency>) => void
}) {
  const routeId = get(modification, 'routes[0]')
  const routePatterns = useRoutePatterns(bundle._id, modification.feed, routeId)
  const routeStops = useRouteStops(bundle._id, modification.feed, routeId)
  const routeTrips = useRouteTrips(bundle._id, modification.feed, routeId)
  const trips = useMemo(() => {
    return uniq(modification.entries.flatMap((e) => e.patternTrips))
  }, [modification.entries])
  const filteredPatterns = useMemo(() => {
    if (trips?.length > 0) {
      return routePatterns.filter((p) => intersects(p.associatedTripIds, trips))
    } else {
      return routePatterns
    }
  }, [routePatterns, trips])

  const _onRouteChange = (feed: string, routes: string[]) => {
    update({
      entries: modification.entries.map((entry) => ({
        ...entry,
        sourceTrip: null,
        patternTrips: []
      })),
      feed,
      routes
    })
  }

  const _replaceEntry =
    (index: number) => (newEntryProps: Partial<CL.FrequencyEntry>) => {
      const entries = [...modification.entries]
      entries[index] = {
        ...entries[index],
        ...newEntryProps
      }
      update({entries})
    }

  const _removeEntry = (index: number) => () => {
    const entries = [...modification.entries]
    entries.splice(index, 1)
    update({entries})
  }

  const _newEntry = () => {
    const newEntry = createFrequencyEntry(modification.entries.length)
    update({entries: [...modification.entries, newEntry]})
  }

  const _setRetainTripsOutsideFrequencyEntries = (e) => {
    update({
      retainTripsOutsideFrequencyEntries: e.currentTarget.checked
    })
  }

  return (
    <Stack spacing={4}>
      <PatternGeometry color={MAP_COLOR} patterns={filteredPatterns} />
      <DirectionalMarkers color={MAP_COLOR} patterns={filteredPatterns} />

      <Box>
        <SelectFeedAndRoutes
          bundle={bundle}
          modification={modification}
          onChange={_onRouteChange}
        />
      </Box>

      <Checkbox
        fontWeight='normal'
        onChange={_setRetainTripsOutsideFrequencyEntries}
        isChecked={modification.retainTripsOutsideFrequencyEntries}
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

      {modification.entries?.map((entry, eidx) => (
        <FrequencyEntry
          entry={entry}
          feedId={modification.feed}
          key={eidx}
          remove={_removeEntry(eidx)}
          routePatterns={routePatterns}
          routeStops={routeStops}
          routeTrips={routeTrips}
          update={_replaceEntry(eidx)}
        />
      ))}
    </Stack>
  )
}
