import NextLink from 'next/link'

import {PageKey} from 'lib/constants'
import useLink from 'lib/hooks/use-link'

type LinkProps = {
  children: React.ReactNode
  to: PageKey
  query?: Record<string, string>
}

export default function InternalLink({children, to, query = {}}: LinkProps) {
  return (
    <NextLink href={useLink(to, query)} passHref>
      {children}
    </NextLink>
  )
}

export function ALink({
  children,
  className = '',
  to,
  query = {}
}: LinkProps & {className?: string}) {
  return (
    <InternalLink to={to} query={query}>
      <a className={className}>{children}</a>
    </InternalLink>
  )
}

export function ExternalLink({children, href}) {
  return (
    <a href={href} rel='noopener noreferrer' target='_blank'>
      {children}
    </a>
  )
}
