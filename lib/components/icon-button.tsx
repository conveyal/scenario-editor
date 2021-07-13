import {Box, BoxProps, ButtonProps} from '@chakra-ui/react'
import {Placement} from '@popperjs/core'
import {forwardRef} from 'react'

import TipButton from './tip-button'

type IconButtonProps = {
  children: JSX.Element
  isActive?: boolean
  isDisabled?: boolean
  label: string
  onClick?: ButtonProps['onClick']
  placement?: Placement
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  colorScheme?: ButtonProps['colorScheme']
} & BoxProps

const IconButton = forwardRef<HTMLDivElement, IconButtonProps>(
  (
    {
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
    },
    ref
  ) => {
    return (
      <Box ref={ref} {...p}>
        <TipButton
          label={label}
          placement={placement ?? 'auto'}
          isActive={isActive}
          isDisabled={isDisabled}
          onClick={onClick}
          size={size}
          variant={variant}
          colorScheme={colorScheme}
        >
          {children}
        </TipButton>
      </Box>
    )
  }
)

export default IconButton
