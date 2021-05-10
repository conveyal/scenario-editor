import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertStatus,
  Box,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'
import measureArea from '@turf/area'
import bboxPolygon from '@turf/bbox-polygon'
import {format} from 'd3-format'
import startCase from 'lodash/startCase'
import {ChangeEventHandler, useEffect, useState} from 'react'

import DocsLink from 'lib/components/docs-link'
import {SPACING_FORM} from 'lib/constants/chakra'
import message from 'lib/message'
import calculateGridPoints from 'lib/utils/calculate-grid-points'

type Direction = {
  name: 'north' | 'south' | 'east' | 'west'
  min: number
  max: number
  isValid: (value: number, bounds: CL.Bounds) => boolean
}

const directions: Direction[] = [
  {
    name: 'north',
    min: -90,
    max: 90,
    isValid: (n, b) => n > b.south
  },
  {
    name: 'south',
    min: -90,
    max: 90,
    isValid: (s, b) => s < b.north
  },
  {
    name: 'east',
    min: -180,
    max: 180,
    isValid: (e, b) => e > b.west
  },
  {
    name: 'west',
    min: -180,
    max: 180,
    isValid: (w, b) => w < b.east
  }
]

const lats = [directions[0], directions[1]]
const longs = [directions[2], directions[3]]

export default function EditBoundsForm(p: {
  bounds: CL.Bounds
  isDisabled: boolean
  onChange: (name: string, newValue: number) => void
}) {
  const [bounds, setBounds] = useState(p.bounds)
  const [isFocused, setIsFocused] = useState(false)

  // Update local bounds if external bounds changed while input is not focused
  useEffect(() => {
    if (!isFocused) setBounds(p.bounds)
  }, [isFocused, p.bounds])

  function boundIsInvalid(dir: Direction, value: string | number) {
    const parsed = typeof value === 'string' ? parseFloat(value) : value
    return (
      isNaN(parsed) ||
      parsed < dir.min ||
      parsed > dir.max ||
      !dir.isValid(parsed, bounds)
    )
  }

  const onChange = (d: Direction): ChangeEventHandler<HTMLInputElement> => (
    e
  ) => {
    const value = e.target.value
    setBounds((b) => ({...b, [d.name]: value}))
    if (!boundIsInvalid(d, value)) p.onChange(d.name, parseFloat(value))
  }

  return (
    <Stack spacing={SPACING_FORM}>
      <Heading size='md'>
        {message('region.bounds')}
        <DocsLink ml={2} to='analysis/methodology#spatial-resolution' />
      </Heading>
      <Text>{message('region.boundsNotice')} </Text>
      <Stack>
        <Stack isInline>
          {lats.map((d) => (
            <FormControl
              isDisabled={p.isDisabled}
              isInvalid={boundIsInvalid(d, bounds[d.name])}
              isRequired
              key={d.name}
            >
              <FormLabel htmlFor={`${d.name}-bound`}>
                {startCase(d.name)}
              </FormLabel>
              <Input
                onBlur={() => setIsFocused(false)}
                onChange={onChange(d)}
                onFocus={() => setIsFocused(true)}
                id={`${d.name}-bound`}
                value={bounds[d.name]}
              />
            </FormControl>
          ))}
        </Stack>
        <Text color='gray.500' fontSize='sm'>
          Must be between -90 and 90 degrees.
        </Text>
      </Stack>
      <Stack>
        <Stack isInline>
          {longs.map((d) => (
            <FormControl
              isDisabled={p.isDisabled}
              isInvalid={boundIsInvalid(d, bounds[d.name])}
              isRequired
              key={d.name}
            >
              <FormLabel htmlFor={`${d.name}-bound`}>
                {startCase(d.name)}
              </FormLabel>
              <Input
                onBlur={() => setIsFocused(false)}
                onChange={onChange(d)}
                onFocus={() => setIsFocused(true)}
                id={`${d.name}-bound`}
                value={bounds[d.name]}
              />
            </FormControl>
          ))}
        </Stack>
        <Text color='gray.500' fontSize='sm'>
          Must be between -180 and 180 degrees.
        </Text>
      </Stack>
      <Size bounds={bounds} />
    </Stack>
  )
}

const formatLarge = format('.4s')
const originsToStatus = (areaKm: number): AlertStatus =>
  areaKm >= 1_000_000 ? 'error' : areaKm >= 100_000 ? 'warning' : 'info'
function Size({bounds}: {bounds: CL.Bounds}) {
  const bbox = bboxPolygon([
    bounds.west,
    bounds.south,
    bounds.east,
    bounds.north
  ])
  const areaKm = Math.round(measureArea(bbox) / 1_000)
  const originPoints = calculateGridPoints(bounds)
  return (
    <Alert className='DEV' status={originsToStatus(originPoints)}>
      <AlertIcon />
      <AlertDescription>
        <strong>{formatLarge(areaKm)} </strong> kilometers squared
        <br />
        <strong>{formatLarge(originPoints)} </strong> origin points
      </AlertDescription>
    </Alert>
  )
}
