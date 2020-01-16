import {PseudoBox} from '@chakra-ui/core'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import React from 'react'

import {CB_HEX, CB_DARK} from 'lib/constants'

import Icon from './icon'

function LinkBox({children, ...p}) {
  return (
    <PseudoBox
      color={CB_HEX}
      cursor='pointer'
      textDecoration='underline'
      _hover={{color: CB_DARK}}
      {...p}
    >
      {children}
    </PseudoBox>
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
        {children} <Icon icon={faExternalLinkAlt} />
      </a>
    </LinkBox>
  )
}
