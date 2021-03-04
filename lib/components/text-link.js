import {Box} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

import {CB_HEX, CB_DARK} from 'lib/constants'

import {ExternalLinkIcon} from './icons'

function LinkBox({children, ...p}) {
  return (
    <Box
      color={CB_HEX}
      cursor='pointer'
      textDecoration='underline'
      _hover={{color: CB_DARK}}
      {...p}
    >
      {children}
    </Box>
  )
}

export default function TextLink({children, href, ...p}) {
  return (
    <LinkBox {...p}>
      <Link href={href}>
        <a>{children}</a>
      </Link>
    </LinkBox>
  )
}

export function ExternalLink({children, href, ...p}) {
  return (
    <LinkBox {...p}>
      <a href={href} target='_blank' rel='noopener noreferrer'>
        {children} <ExternalLinkIcon style={{display: 'inline-block'}} />
      </a>
    </LinkBox>
  )
}
