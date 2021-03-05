import {Button, Flex, FormControl, FormLabel, Stack} from '@chakra-ui/react'
import lonlat from '@conveyal/lonlat'
import dynamic from 'next/dynamic'
import {useState} from 'react'

import {EditIcon, XIcon} from 'lib/components/icons'
import message from 'lib/message'
import R5Selector from 'lib/modules/r5-version/components/selector'

import Select from '../select'

const EditBounds = dynamic(() => import('../map/edit-bounds'), {ssr: false})

/**
 * Edit the advanced parameters of an analysis.
 */
export default function AdvancedSettings({
  disabled,
  profileRequest,
  regionalAnalyses,
  regionBounds,
  updateProfileRequest,
  ...p
}) {
  return (
    <Stack isInline spacing={5} {...p}>
      <R5Selector
        flex='1'
        isDisabled={disabled}
        onChange={(workerVersion) => updateProfileRequest({workerVersion})}
        value={profileRequest.workerVersion}
      />

      <CustomBoundsSelector
        flex='1'
        isDisabled={disabled}
        profileRequest={profileRequest}
        regionalAnalyses={regionalAnalyses}
        regionBounds={regionBounds}
        updateProfileRequest={updateProfileRequest}
      />
    </Stack>
  )
}

/**
 * Options available are:
 * 1. Bounds of the region
 * 2. Previously run analysis bounds that are different than the regions.
 * 3. Creating a "Custom Boundary"
 */
function CustomBoundsSelector({
  isDisabled,
  profileRequest,
  regionBounds,
  regionalAnalyses,
  updateProfileRequest,
  ...p
}) {
  const [editingBounds, setEditingBounds] = useState(false)
  const {bounds} = profileRequest

  // figure out which is selected
  let selected
  if (!bounds || boundsEqual(bounds, regionBounds)) {
    selected = '__REGION' // special value
  } else {
    const selectedAnalysis = regionalAnalyses.find((r) =>
      boundsEqual(webMercatorBoundsToGeographic(r), bounds)
    )

    if (selectedAnalysis != null) selected = selectedAnalysis._id
    else selected = '__CUSTOM'
  }

  const options = [
    {value: '__REGION', label: message('analysis.regionalBoundsRegion')},
    ...regionalAnalyses
      .filter(
        (r) => !boundsEqual(webMercatorBoundsToGeographic(r), regionBounds)
      )
      .map(({name, _id}) => ({
        value: _id,
        label: message('analysis.regionalBoundsSame', {name})
      }))
  ]

  if (selected === '__CUSTOM') {
    // Don't allow the user to select 'Custom' - to make custom bounds, just drag the map markers
    options.push({
      value: '__CUSTOM',
      label: message('analysis.regionalBoundsCustom'),
      disabled: true
    })
  }

  function _setRegionalAnalysisBounds(e) {
    if (e.value === '__REGION') {
      updateProfileRequest({bounds: regionBounds})
    } else if (regionalAnalyses) {
      const foundAnalyses = regionalAnalyses.find((r) => r._id === e.value)
      if (foundAnalyses) {
        updateProfileRequest({
          bounds: webMercatorBoundsToGeographic(foundAnalyses)
        })
      }
    }
  }

  return (
    <FormControl isDisabled={isDisabled} {...p}>
      {editingBounds && (
        <EditBounds
          bounds={profileRequest.bounds}
          save={(bounds) => updateProfileRequest({bounds})}
        />
      )}
      <Flex justifyContent='space-between'>
        <FormLabel htmlFor='customBoundsSelect' whiteSpace='nowrap'>
          {message('analysis.regionalBounds')}
        </FormLabel>
        {editingBounds ? (
          <Button
            onClick={(e) => {
              e.preventDefault()
              setEditingBounds(false)
            }}
            rightIcon={<XIcon />}
            size='xs'
            colorScheme='yellow'
          >
            Stop editing
          </Button>
        ) : (
          <Button
            isDisabled={isDisabled}
            onClick={(e) => {
              e.preventDefault()
              setEditingBounds(true)
            }}
            rightIcon={<EditIcon />}
            size='xs'
            colorScheme='yellow'
          >
            Set custom
          </Button>
        )}
      </Flex>
      <div>
        <Select
          inputId='customBoundsSelect'
          isDisabled={isDisabled}
          value={options.find((o) => o.value === selected)}
          options={options}
          onChange={_setRegionalAnalysisBounds}
        />
      </div>
    </FormControl>
  )
}

function boundsEqual(b0, b1, epsilon = 1e-6) {
  return (
    Math.abs(b0.north - b1.north) < epsilon &&
    Math.abs(b0.west - b1.west) < epsilon &&
    Math.abs(b0.east - b1.east) < epsilon &&
    Math.abs(b0.south - b1.south) < epsilon
  )
}

/**
 * Convert web mercator bounds from a regional analysis to geographic bounds.
 */
function webMercatorBoundsToGeographic({north, west, width, height, zoom}) {
  const nw = lonlat.fromPixel(
    {
      x: west + 1,
      y: north
    },
    zoom
  )
  const se = lonlat.fromPixel(
    {
      x: west + width + 1,
      y: north + height
    },
    zoom
  )
  return {
    east: se.lon,
    north: nw.lat,
    south: se.lat,
    west: nw.lon
  }
}
