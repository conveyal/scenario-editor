import {Link} from '@chakra-ui/core'
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons'

import Icon from './icon'
import Tip from './tip'

const docsBaseURL = 'https://docs.conveyal.com'
const _hover = {color: 'blue.700'}

export default function DocsLink({to, ...p}) {
  return (
    <Tip label='View docs to learn more'>
      <Link
        color='blue.500'
        href={`${docsBaseURL}/${to}`}
        isExternal
        _hover={_hover}
        {...p}
      >
        <Icon icon={faInfoCircle} />
      </Link>
    </Tip>
  )
}
