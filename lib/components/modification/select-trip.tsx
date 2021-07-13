import fpGet from 'lodash/fp/get'

import labelTrip from 'lib/gtfs/label-trip'

import ControlledSelect from '../controlled-select'

const getTripId = fpGet('id')

/**
 * Trip selector.
 */
export default function SelectTrip({
  onChange,
  trips,
  sourceTrip,
  ...p
}: {
  onChange: (newTrip: GTFS.Trip) => void
  trips: GTFS.Trip[]
  sourceTrip: string
}) {
  return (
    <ControlledSelect
      {...p}
      label='Select trip'
      getOptionLabel={labelTrip}
      getOptionValue={getTripId}
      onChange={(t) => onChange(t)}
      options={trips}
      value={trips.find((t) => t.id === sourceTrip)}
    />
  )
}
