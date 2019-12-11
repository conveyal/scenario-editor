import {PseudoBox} from '@chakra-ui/core'
import Router from 'next/router'
import React from 'react'

import {CB_HEX, CB_DARK} from 'lib/constants'

export default function Link({children, to, ...p}) {
  return (
    <PseudoBox
      color={CB_HEX}
      cursor='pointer'
      textDecoration='underline'
      _hover={{color: CB_DARK}}
      {...p}
      onClick={() => Router.push(to)}
    >
      {children}
    </PseudoBox>
  )
}
