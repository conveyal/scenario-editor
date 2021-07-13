import {Box, Stack} from '@chakra-ui/react'
import useCurrentRegion from 'lib/hooks/use-current-region'
import useRegionalAnalyses from 'lib/hooks/use-regional-analyses'

import R5Selector from 'lib/modules/r5-version/components/selector'

import CustomBoundsSelector from './custom-bounds-selector'

/**
 * Edit the advanced parameters of an analysis.
 */
export default function AdvancedSettings({
  disabled,
  profileRequest,
  updateProfileRequest
}: {
  disabled: boolean
  profileRequest: CL.ProfileRequest
  updateProfileRequest: (profileRequest: Partial<CL.ProfileRequest>) => void
}) {
  const region = useCurrentRegion()
  const {data: regionalAnalyses} = useRegionalAnalyses(region?._id)
  return (
    <Stack isInline spacing={5}>
      <Box flex='1'>
        <R5Selector
          isDisabled={disabled}
          onChange={(workerVersion) => updateProfileRequest({workerVersion})}
          regionalAnalyses={regionalAnalyses}
          value={profileRequest.workerVersion}
        />
      </Box>

      <Box flex='1'>
        <CustomBoundsSelector
          isDisabled={disabled}
          profileRequest={profileRequest}
          regionalAnalyses={regionalAnalyses}
          regionBounds={region.bounds}
          updateProfileRequest={updateProfileRequest}
        />
      </Box>
    </Stack>
  )
}
