import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  PortalManager,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'
import lonlat from '@conveyal/lonlat'
import type {LatLngBoundsExpression, Map} from 'leaflet'
import {RefObject, useEffect, useRef, useState} from 'react'
import {useLeaflet} from 'react-leaflet'

import {POPOVER_Z} from 'lib/constants/z-index'
import mapboxSearch, {MapboxFeature} from 'lib/utils/mapbox-search'

import {SearchIcon} from '../icons'

type OnResultsFn = (r: MapboxFeature, map: Map) => void

type GeocoderProps = {
  isDisabled?: boolean
  onChange?: OnResultsFn
}

const panToResult: OnResultsFn = (r, map) => {
  if (r && map) {
    if (r.bbox) {
      const [west, south, east, north] = r.bbox
      const bounds: LatLngBoundsExpression = [
        [south, west],
        [north, east]
      ]
      map.fitBounds(bounds)
    } else {
      map.setView([r.center[1], r.center[0]], 19)
    }
    map.fire('geocode', r)
  }
}

const subText = (m: MapboxFeature) => {
  const firstComma = m.place_name.indexOf(',')
  if (firstComma > 0) {
    return m.place_name.substr(firstComma + 2)
  } else {
    return m.place_name
  }
}

export function GeocoderSearch({
  inputRef,
  onChange
}: {
  inputRef: RefObject<HTMLInputElement>
  onChange: OnResultsFn
}) {
  const {map} = useLeaflet()
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<MapboxFeature[]>([])
  const center = map?.getCenter()
  const proximityStr = center ? lonlat.toString(center) : ''

  useEffect(() => {
    if (search && search.length > 3) {
      setIsLoading(true)
      mapboxSearch(
        search,
        {
          proximity: proximityStr
        },
        (results) => {
          setIsLoading(false)
          setResults(results)
        }
      )
    }
  }, [proximityStr, search])

  return (
    <Stack spacing={0}>
      <InputGroup>
        <InputLeftElement mt={1}>
          <SearchIcon />
        </InputLeftElement>
        <Input
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder='Search map'
          ref={inputRef}
          size='lg'
          value={search}
          variant='flushed'
        />
        <InputRightElement>{isLoading && <Spinner />}</InputRightElement>
      </InputGroup>
      {results.map((r) => (
        <Box
          key={r.id}
          cursor='pointer'
          onClick={() => onChange(r, map)}
          px={3}
          py={2}
          _hover={{
            bg: 'blue.500',
            color: 'white'
          }}
          rounded={0}
          fontSize='lg'
          textAlign='left'
          title={r.place_name}
        >
          <Text
            fontWeight='bold'
            overflowX='hidden'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
          >
            {r.place_name.split(',')[0]}
          </Text>
          <Text overflowX='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
            {subText(r)}
          </Text>
        </Box>
      ))}
    </Stack>
  )
}

export default function GeocoderPopper({
  isDisabled,
  onChange = panToResult
}: GeocoderProps) {
  const initialFocusRef = useRef()

  return (
    <PortalManager zIndex={POPOVER_Z}>
      <Popover initialFocusRef={initialFocusRef} isLazy placement='left'>
        {({onClose}) => (
          <>
            <PopoverTrigger>
              <Button
                colorScheme='blue'
                isDisabled={isDisabled}
                shadow='lg'
                title='Search map'
              >
                <SearchIcon />
              </Button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent shadow='lg'>
                <PopoverBody p={0}>
                  <GeocoderSearch
                    inputRef={initialFocusRef}
                    onChange={(r, map) => {
                      onChange(r, map)
                      onClose()
                    }}
                  />
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    </PortalManager>
  )
}
