import {FormControl, FormLabel, FormHelperText, Select} from '@chakra-ui/react'
import startCase from 'lodash/startCase'
import React from 'react'

import {ALL_TRANSIT_MODES} from '../constants'

const toStartCase = (o) => startCase(o.toLowerCase())

const r5Warning =
  'Note: routing engine versions prior to v4.6.0 will use tram regardless.'

/**
 * Only show an empty option if no mode has been selected. Do not allow de-selection.
 */
export default function TransitModeSelector({onChange, value, ...p}) {
  return (
    <FormControl {...p}>
      <FormLabel htmlFor='transitMode'>Transit Mode</FormLabel>
      <Select
        id='transitMode'
        onChange={(e) => {
          const mode = parseInt(e.target.value)
          if (mode >= 0) onChange(mode)
        }}
        value={value}
      >
        {ALL_TRANSIT_MODES.map((m, i) => (
          <option key={m} value={i}>
            {toStartCase(m)}
          </option>
        ))}
      </Select>
      <FormHelperText>{r5Warning}</FormHelperText>
    </FormControl>
  )
}
