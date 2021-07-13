import {Stack, Text} from '@chakra-ui/react'

import message from 'lib/message'

type Day =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

const days: Day[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

/**
 * Show days of service
 */
export default function DaysOfService(p: {timetable: CL.AbstractTimetable}) {
  return (
    <Stack isInline>
      {days.map((d) => (
        <Text
          color={p[d] ? 'black' : 'gray'}
          key={d}
          textDecoration={p[d] ? 'none' : 'line-through'}
        >
          {message(`report.days.${d}`)}
        </Text>
      ))}
    </Stack>
  )
}
