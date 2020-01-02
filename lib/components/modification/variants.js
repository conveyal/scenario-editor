import {Checkbox, Stack} from '@chakra-ui/core'
import React from 'react'

import message from 'lib/message'

import H5 from '../h5'

export default function Variants(p) {
  return (
    <>
      <H5>{message('variant.activeIn')}</H5>
      <Stack mb={4} spacing={2}>
        {p.allVariants.map((v, i) => (
          <Checkbox
            fontWeight='normal'
            isChecked={p.activeVariants[i]}
            key={`${i}-${v}`}
            name={v}
            onChange={e => p.setVariant(i, e.target.checked)}
            value={i}
          >
            {i + 1}. {v}
          </Checkbox>
        ))}
      </Stack>
    </>
  )
}
