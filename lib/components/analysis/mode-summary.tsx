import {Box, Stack, Tooltip} from '@chakra-ui/core'
import {faChevronRight} from '@fortawesome/free-solid-svg-icons'

import Icon from '../icon'
import ModeIcon from '../mode-icon'

export default function ModeSummary({
  accessModes,
  color = 'blue',
  egressModes,
  max = 4,
  transitModes
}) {
  const transitModesArray = transitModes.split(',')

  return (
    <Stack align='center' isInline spacing={1}>
      <ModeIcon mode={accessModes} />
      {transitModes.length > 0 && (
        <Tooltip
          hasArrow
          aria-label={transitModesArray.join(', ')}
          label={transitModesArray.join(', ')}
          zIndex={1000}
        >
          <Stack align='center' isInline spacing={1}>
            <Box color={`${color}.500`} fontSize='xs'>
              <Icon icon={faChevronRight} />
            </Box>
            {transitModesArray.slice(0, max).map((m) => (
              <ModeIcon mode={m} key={m} />
            ))}
            {transitModesArray.length > max && <Box>...</Box>}
            {egressModes !== 'WALK' && (
              <Stack align='center' isInline spacing={1}>
                <Box color={`${color}.500`} fontSize='xs'>
                  <Icon icon={faChevronRight} />
                </Box>
                <ModeIcon mode={egressModes} />
              </Stack>
            )}
          </Stack>
        </Tooltip>
      )}
    </Stack>
  )
}
