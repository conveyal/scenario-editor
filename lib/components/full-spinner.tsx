import {Flex} from '@chakra-ui/react'

import Spinner from './spinner'

const minWidth = '320px'

export default function FullSpinner() {
  return (
    <Flex
      align='center'
      color='#2389c9'
      direction='column'
      fontSize='36px'
      height='100vh'
      m='0 auto'
      marginTop='-25px'
      justify='center'
      width={minWidth}
    >
      <Spinner />
    </Flex>
  )
}
