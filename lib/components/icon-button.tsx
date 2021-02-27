import {Box, BoxProps, Button, ButtonProps} from '@chakra-ui/react'
import {Placement} from '@popperjs/core'

import Tip from './tip'

type IconButtonProps = {
  children: JSX.Element
  isActive?: boolean
  isDisabled?: boolean
  label: string
  onClick: ButtonProps['onClick']
  placement?: Placement
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  colorScheme?: ButtonProps['colorScheme']
} & BoxProps

export default function IconButton({
  children,
  isActive = false,
  isDisabled = false,
  label,
  onClick,
  placement,
  size = 'sm',
  variant = 'ghost',
  colorScheme = 'blue',
  ...p
}: IconButtonProps) {
  return (
    <Box {...p}>
      <Tip label={label} placement={placement || 'auto'}>
        <Button
          aria-label={label}
          isActive={isActive}
          isDisabled={isDisabled}
          onClick={onClick}
          size={size}
          variant={variant}
          colorScheme={colorScheme}
        >
          {children}
        </Button>
      </Tip>
    </Box>
  )
}
