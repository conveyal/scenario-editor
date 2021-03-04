import {Box, Stack} from '@chakra-ui/react'

import {ChevronRight} from '../icons'
import ModeIconBox from '../mode-icon'
import Tip from '../tip'

export default function ModeSummary({
  accessModes,
  color = 'blue',
  egressModes,
  max = 4,
  transitModes
}) {
  const accessModesArray = accessModes.split(',')
  const transitModesArray = transitModes.split(',')
  const egressModesArray = egressModes.split(',')

  return (
    <Stack align='center' isInline spacing={1}>
      {accessModesArray.map((m) => (
        <ModeIconBox key={m} mode={m} />
      ))}
      {transitModes.length > 0 && (
        <Tip label={transitModesArray.join(', ')}>
          <Stack align='center' isInline spacing={1}>
            <Box color={`${color}.500`} fontSize='xs'>
              <ChevronRight />
            </Box>
            {transitModesArray.slice(0, max).map((m) => (
              <ModeIconBox mode={m} key={m} />
            ))}
            {transitModesArray.length > max && <Box>...</Box>}
            {egressModes !== 'WALK' && (
              <Stack align='center' isInline spacing={1}>
                <Box color={`${color}.500`} fontSize='xs'>
                  <ChevronRight />
                </Box>
                {egressModesArray.map((m) => (
                  <ModeIconBox key={m} mode={m} />
                ))}
              </Stack>
            )}
          </Stack>
        </Tip>
      )}
    </Stack>
  )
}
