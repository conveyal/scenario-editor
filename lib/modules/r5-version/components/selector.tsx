import {Alert, Box, Flex, FormControl, FormLabel} from '@chakra-ui/react'
import get from 'lodash/get'
import {useSelector} from 'react-redux'
import Creatable from 'react-select/creatable'

import {ErrorIcon} from 'lib/components/icons'
import {selectStyles} from 'lib/components/select'
import Tip from 'lib/components/tip'
import message from 'lib/message'

import {MINIMUM_R5_VERSION, RECOMMENDED_R5_VERSION} from '../constants'
import * as select from '../selectors'
import {versionToNumber} from '../utils'

// Minimum version number
const MIN_VERSION = versionToNumber(MINIMUM_R5_VERSION)

// Create a new option from the select box
const _isValidNewOption = (newOption) => {
  try {
    return versionToNumber(newOption) >= MIN_VERSION
  } catch (e) {
    console.error(e)
    return false
  }
}

const _promptTextCreator = (label) =>
  `Use "${label}" — WARNING: this will fail if this .jar does not exist on S3.`

// Wrap text in a span and style it with a line-through
const lineThrough = (text) => (
  <span style={{textDecoration: 'line-through'}}>{text}</span>
)

/**
 * Select an R5 version, based on what is available in S3
 */
export default function SelectR5Version({onChange, value, ...p}) {
  const usedVersions = useSelector(select.usedVersions)

  const currentVersionNumber = versionToNumber(value)
  const lastUsedVersion = get(usedVersions, '[0].version')
  const options = [
    {
      value: RECOMMENDED_R5_VERSION,
      label: `${RECOMMENDED_R5_VERSION} (recommended)`
    }
  ]

  function _selectVersion(result) {
    const version = get(result, 'value', result)
    if (versionToNumber(version) < MIN_VERSION) {
      return window.alert(
        message('r5Version.invalidVersion', {
          version,
          minimum: MINIMUM_R5_VERSION
        })
      )
    }
    onChange(version)
  }

  if (value !== RECOMMENDED_R5_VERSION) {
    options.push({
      value,
      label: currentVersionNumber < MIN_VERSION ? lineThrough(value) : value
    })
  }

  usedVersions.forEach((uv) => {
    if (
      uv.version === RECOMMENDED_R5_VERSION ||
      versionToNumber(uv.version) < MIN_VERSION
    )
      return
    options.push({
      value: uv.version,
      label: `${uv.version} — used in ${uv.name}`
    })
  })

  return (
    <FormControl {...p}>
      <Flex justify='space-between'>
        <FormLabel htmlFor='select-r5-version'>
          {message('r5Version.title')}
        </FormLabel>
        <div>
          {lastUsedVersion && lastUsedVersion !== value && (
            <Tip label={message('r5Version.analysisVersionDifferent')}>
              <Box color='yellow.500'>
                <ErrorIcon />
              </Box>
            </Tip>
          )}
        </div>
      </Flex>
      <div>
        <Creatable
          name='select-r5-version'
          inputId='select-r5-version'
          formatCreateLabel={_promptTextCreator}
          isDisabled={p.isDisabled}
          isValidNewOption={_isValidNewOption}
          onChange={_selectVersion}
          options={options}
          styles={selectStyles}
          value={options.find((v) => v.value === value)}
        />
      </div>
      {currentVersionNumber < versionToNumber(RECOMMENDED_R5_VERSION) && (
        <Alert status='warning'>
          {message('r5Version.latestReleaseVersionNotSelected')}
        </Alert>
      )}
    </FormControl>
  )
}
