import {useColorModeValue} from '@chakra-ui/react'

import MapboxGL from './mapbox-gl'

const lightStyle =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE ?? 'conveyal/cjwu7oipd0bf41cqqv15huoim'
const darkStyle = 'conveyal/cklwkj6g529qi17nydq56jn9k'
const getStyle = (style: string) => `mapbox://styles/${style}`

export default function BaseMap() {
  const style = useColorModeValue(lightStyle, darkStyle)
  return <MapboxGL style={getStyle(style)} />
}
