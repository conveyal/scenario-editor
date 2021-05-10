import {Link, LinkProps} from '@chakra-ui/react'

import {InfoIcon} from './icons'
import Tip from './tip'

const docsBaseURL = 'https://docs.conveyal.com'
const _hover = {color: 'blue.700'}

export default function DocsLink({
  to,
  ...p
}: {
  to: string
} & LinkProps) {
  return (
    <Tip label='View docs to learn more'>
      <Link
        color='blue.500'
        display='inline-block'
        href={`${docsBaseURL}/${to}`}
        isExternal
        _hover={_hover}
        {...p}
      >
        <InfoIcon />
      </Link>
    </Tip>
  )
}
