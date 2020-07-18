import {Box, BoxProps, Button, Tooltip, ButtonProps} from '@chakra-ui/core'
import {PopperProps} from '@chakra-ui/core/dist/Popper'
import {IconDefinition} from '@fortawesome/free-solid-svg-icons'

import Icon from './icon'

type SimpleIconButtonProps = {
  icon: IconDefinition
  isActive?: boolean
  label: string
  onClick: (e: MouseEvent) => void
  placement?: PopperProps['placement']
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: ButtonProps['variant']
  variantColor?: ButtonProps['variantColor']
} & BoxProps

export default function SimpleIconButton({
  icon,
  isActive = false,
  label,
  onClick,
  placement,
  size = 'sm',
  variant = 'ghost',
  variantColor = 'blue',
  ...p
}: SimpleIconButtonProps) {
  return (
    <Box {...p}>
      <Tooltip
        aria-label={label}
        hasArrow
        label={label}
        placement={placement || 'auto'}
        zIndex={1000}
      >
        <Button
          aria-label={label}
          isActive={isActive}
          onClick={onClick}
          size={size}
          variant={variant}
          variantColor={variantColor}
        >
          <Icon icon={icon} fixedWidth={false} />
        </Button>
      </Tooltip>
    </Box>
  )
}
