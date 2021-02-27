import {Link} from '@chakra-ui/react'
import NextLink from 'next/link'

import {toHref} from 'lib/router'

export default function InternalLink({children, to, ...p}) {
  return (
    <NextLink href={toHref(to, p)} passHref>
      {children}
    </NextLink>
  )
}

const _hover = {color: 'blue.700'}
export function ALink({children, className = '', to, ...p}) {
  return (
    <InternalLink to={to} {...p}>
      <Link className={className} color='blue.500' _hover={_hover}>
        {children}
      </Link>
    </InternalLink>
  )
}

export function ExternalLink({children, href}) {
  return (
    <Link color='blue.500' _hover={_hover} href={href} isExternal>
      {children}
    </Link>
  )
}
