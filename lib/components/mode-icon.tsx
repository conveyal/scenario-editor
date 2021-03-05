import {Box, BoxProps, Text} from '@chakra-ui/react'
import toStartCase from 'lodash/startCase'

import {
  BikeIcon,
  BusIcon,
  CarIcon,
  ParkingIcon,
  ShipIcon,
  SubwayIcon,
  TrainIcon,
  WalkerIcon
} from 'lib/components/icons'

type Mode =
  | 'BICYCLE'
  | 'BICYCLE_RENT'
  | 'BUS'
  | 'CABLE_CAR'
  | 'CAR'
  | 'CAR_PARK'
  | 'FERRY'
  | 'FUNICULAR'
  | 'GONDOLA'
  | 'RAIL'
  | 'SUBWAY'
  | 'TRAM'
  | 'WALK'

const Letter = ({children}) => (
  <Text
    fontFamily='mono'
    fontSize='14px'
    fontWeight={600}
    height='17px'
    lineHeight='1.5rem'
    textAlign='center'
    width='15px'
  >
    {children}
  </Text>
)

export function ModeIcon({mode}: {mode: Mode}) {
  switch (mode) {
    case 'BICYCLE':
    case 'BICYCLE_RENT':
      return <BikeIcon />
    case 'BUS':
      return <BusIcon />
    case 'CABLE_CAR':
      return <Letter>C</Letter>
    case 'CAR':
      return <CarIcon />
    case 'CAR_PARK':
      return <ParkingIcon />
    case 'FERRY':
      return <ShipIcon />
    case 'FUNICULAR':
      return <Letter>F</Letter>
    case 'GONDOLA':
      return <Letter>G</Letter>
    case 'RAIL':
      return <TrainIcon />
    case 'SUBWAY':
      return <SubwayIcon />
    case 'TRAM':
      return <Letter>T</Letter>
    case 'WALK':
      return <WalkerIcon />
    default:
      console.error(`${mode} does not exist`)
      return null
  }
}

type ModeIconProps = {
  mode: Mode
} & BoxProps

export default function ModeIconBox({mode, ...p}: ModeIconProps) {
  return (
    <Box {...p} title={toStartCase(mode)}>
      <ModeIcon mode={mode} />
    </Box>
  )
}
