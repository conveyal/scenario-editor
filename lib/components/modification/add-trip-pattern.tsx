import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import {useState} from 'react'
import {useSelector} from 'react-redux'

import selectAddTripsGTFSStops from 'lib/selectors/add-trips-gtfs-stops'
import selectNumberOfStops from 'lib/selectors/number-of-stops'

import TransitModeSelector from '../transit-mode-selector'

import EditAlignment from './edit-alignment'
import Timetables from './timetables'

const MapLayer = dynamic(
  () => import('../modifications-map/add-trip-pattern-layer')
)

const blogLink =
  'https://blog.conveyal.com/upgraded-outreach-serverless-transit-accessibility-with-taui-f90d6d51e177'
const colorHelpText = `For display purposes (ex: with <a href="${blogLink}" target="_blank">Taui</a>). Must be a 6-digit hexadecimal number.`

/**
 * Display an add trip pattern modification
 */
export default function AddTripPattern({modification, update}) {
  const [isEditing, setIsEditing] = useState(false)
  const gtfsStops = useSelector(selectAddTripsGTFSStops)
  const numberOfStops = useSelector(selectNumberOfStops)

  return (
    <Stack spacing={4}>
      {!isEditing && (
        <MapLayer
          bidirectional={modification.bidirectional}
          segments={modification.segments}
        />
      )}

      <TransitModeSelector
        onChange={(transitMode) => update({transitMode})}
        value={modification.transitMode}
      />

      <FormControl className='DEV'>
        <FormLabel htmlFor='routeColor'>Route Color</FormLabel>
        <Input
          id='routeColor'
          onChange={(e) => update({color: e.currentTarget.value})}
          value={modification.color || ''}
        />
        <FormHelperText dangerouslySetInnerHTML={{__html: colorHelpText}} />
      </FormControl>

      <EditAlignment
        isEditing={isEditing}
        modification={modification}
        numberOfStops={numberOfStops}
        setIsEditing={setIsEditing}
        update={update}
      />

      <Timetables
        modification={modification}
        modificationStops={gtfsStops}
        numberOfStops={numberOfStops}
        timetables={modification.timetables}
        update={update}
      />
    </Stack>
  )
}
