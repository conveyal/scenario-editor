import {Box, Button, Collapse} from '@chakra-ui/react'
import {useState} from 'react'

import {ChevronDown, ChevronRight} from 'lib/components/icons'

/**
 * A simple collapsible element for hiding children
 */
export default function Collapsible({
  children,
  defaultExpanded = false,
  title,
  ...p
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const icon = expanded ? <ChevronDown /> : <ChevronRight />
  return (
    <Box {...p}>
      <Button
        pb={expanded ? 4 : 0}
        isFullWidth
        leftIcon={icon}
        onClick={() => setExpanded((e) => !e)}
      >
        {title}
      </Button>
      <Collapse in={expanded}>{children}</Collapse>
    </Box>
  )
}
