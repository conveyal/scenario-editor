import {Box} from '@chakra-ui/core'

type DurationsProps = {
  durations?: Record<string, number>
}

const color = (ms: number) =>
  ms < 500 ? 'green.500' : ms > 1000 ? 'red.500' : 'black.500'

export default function Durations({durations}: DurationsProps) {
  // Always log to the developer console.
  console.log('durations', durations)
  return (
    <Box
      bg='white'
      fontSize='sm'
      className='DEV'
      fontFamily='mono'
      p={2}
      position='absolute'
      bottom={0}
      right={0}
      zIndex={10000}
    >
      <Box fontWeight='bold' textAlign='center'>
        durations
      </Box>
      <table>
        <tbody>
          {Object.entries(durations).map(([name, ms]) => (
            <tr key={name}>
              <Box as='td' pr={2} textAlign='right'>
                {name}
              </Box>
              <Box as='td' color={color(ms)} fontWeight='bold'>
                {ms / 1000}s
              </Box>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}
