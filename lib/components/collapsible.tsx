import {Box, Button, Collapse, useDisclosure} from '@chakra-ui/react'

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
  const {isOpen, onToggle} = useDisclosure({defaultIsOpen: defaultExpanded})
  const icon = isOpen ? <ChevronDown /> : <ChevronRight />
  return (
    <Box {...p}>
      <Button
        mb={isOpen ? 4 : 0}
        isFullWidth
        leftIcon={icon}
        onClick={onToggle}
      >
        {title}
      </Button>
      <Collapse in={isOpen}>{children}</Collapse>
    </Box>
  )
}
