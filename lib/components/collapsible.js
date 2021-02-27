import {Box, Button, Collapse} from '@chakra-ui/react'
import React from 'react'

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
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const icon = expanded ? <ChevronDown /> : <ChevronRight />
  return (
    <Box {...p}>
      <Button
        isFullWidth
        leftIcon={icon}
        onClick={() => setExpanded((e) => !e)}
      >
        {title}
      </Button>
      <Collapse isOpen={expanded} pt={4}>
        {children}
      </Collapse>
    </Box>
  )
}
