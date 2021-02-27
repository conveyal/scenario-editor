import {Flex} from '@chakra-ui/react'

import useWindowSize from 'lib/hooks/use-window-size'

import Spinner from './spinner'

const minHeight = '600px'
const minWidth = '320px'

export default function FullSpinner() {
  const size = useWindowSize()
  return (
    <Flex
      align='center'
      color='#2389c9'
      direction='column'
      fontSize='36px'
      height={size.height || minHeight}
      m='0 auto'
      marginTop='-25px'
      justify='center'
      width={minWidth}
    >
      <Spinner />
    </Flex>
  )
}
