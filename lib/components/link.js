import {Button, PseudoBox} from '@chakra-ui/core'
import NextLink from 'next/link'
import {useRouter} from 'next/router'
import React from 'react'

import {routeTo} from 'lib/router'

export default function Link({children, to, ...p}) {
  const {as, href, query} = routeTo(to, p)
  return (
    <NextLink as={as} href={{pathname: href, query}} passHref>
      {children}
    </NextLink>
  )
}

const _hover = {color: 'blue.700'}
export function ALink({children, className = '', ...p}) {
  return (
    <Link {...p}>
      <PseudoBox as='a' className={className} color='blue.500' _hover={_hover}>
        {children}
      </PseudoBox>
    </Link>
  )
}

export function ButtonLink({children, to, queryProps, ...p}) {
  const router = useRouter()
  const {as, href, query} = routeTo(to, queryProps)
  const onClick = () => router.push({pathname: href, query}, as)

  return (
    <Button variantColor='blue' onClick={onClick} {...p}>
      {children}
    </Button>
  )
}
