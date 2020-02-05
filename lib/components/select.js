import dynamic from 'next/dynamic'
import React from 'react'

import {CB_HEX, CB_RGB} from 'lib/constants'

const Select = dynamic(() => import('react-select'), {ssr: false})

export const selectStyles = {
  option: (styles, state) => ({
    ...styles,
    color: state.isSelected ? '#fff' : styles.color,
    backgroundColor: state.isSelected ? CB_HEX : styles.backgroundColor,
    '&:hover': {
      color: '#fff',
      backgroundColor: CB_HEX
    }
  }),
  control: (styles, state) => ({
    ...styles,
    boxShadow: state.isFocused
      ? `0 0 0 0.2rem rgba(${CB_RGB.r}, ${CB_RGB.g}, ${CB_RGB.b}, 0.25)`
      : 0,
    borderColor: state.isFocused ? CB_HEX : styles.borderColor,
    '&:hover': {
      borderColor: state.isFocused ? CB_HEX : styles.borderColor
    }
  })
}

export default function S(p) {
  return <Select styles={selectStyles} {...p} />
}
