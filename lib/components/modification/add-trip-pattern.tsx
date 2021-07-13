import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import {useMemo, useState} from 'react'

import {useBundleStops} from 'lib/gtfs/hooks'
import useNumberOfStops from 'lib/modification/hooks/use-number-of-stops'
import scopeAddTripPatternStops from 'lib/modification/scope-add-trip-pattern-stops'

import TransitModeSelector from '../transit-mode-selector'

import EditAlignment from './edit-alignment'
import Timetables from './timetables'

const MapLayer = dynamic(
  () => import('../modifications-map/add-trip-pattern-layer')
)

const blogLink =
  'https://blog.conveyal.com/upgraded-outreach-serverless-transit-accessibility-with-taui-f90d6d51e177'
const colorHelpText = `For display purposes (ex: with <a href="${blogLink}" target="_blank">Taui</a>). Must be a 6-digit hexadecimal number.`

function useGTFSStops(bundleId: string, modification: CL.AddTripPattern) {
  const allStops = useBundleStops(bundleId)
  return useMemo(() => {
    return scopeAddTripPatternStops(modification, allStops)
  }, [modification, allStops])
}

/**
 * Display an add trip pattern modification
 */
export default function AddTripPattern({
  bundle,
  modification,
  update
}: {
  bundle: CL.Bundle
  modification: CL.AddTripPattern
  update: (updates: Partial<CL.AddTripPattern>) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const gtfsStops = useGTFSStops(bundle._id, modification)
  const numberOfStops = useNumberOfStops(modification)

  return (
    <>
      {!isEditing && (
        <MapLayer
          bidirectional={modification.bidirectional}
          segments={modification.segments}
        />
      )}

      <Stack spacing={4}>
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

        <Box>
          <EditAlignment
            bundleId={bundle._id}
            isEditing={isEditing}
            modification={modification}
            numberOfStops={numberOfStops}
            setIsEditing={setIsEditing}
            update={update}
          />
        </Box>

        <Timetables
          modification={modification}
          modificationStops={gtfsStops}
          numberOfStops={numberOfStops}
          timetables={modification.timetables}
          update={update}
        />
      </Stack>
    </>
  )
}
