import {Button, ButtonProps} from '@chakra-ui/react'
import {Placement} from '@popperjs/core'

import Tip from './tip'

export default function TipButton({
  children,
  label,
  placement,
  ...p
}: ButtonProps & {
  label: string
  placement?: Placement
}) {
  return (
    <Tip label={label} placement={placement || 'auto'}>
      <Button aria-label={label} {...p}>
        {children}
      </Button>
    </Tip>
  )
}
