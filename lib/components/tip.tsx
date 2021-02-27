import {Tooltip, TooltipProps} from '@chakra-ui/react'

const zIndex = 1500 // Chakra modals are set to 1400

type TipProps = Omit<TooltipProps, 'aria-label'> & {
  isDisabled?: boolean
}

// Common Tooltip defaults used acrossed the application
export default function Tip({
  children,
  isDisabled = false,
  label,
  ...p
}: TipProps) {
  if (isDisabled) return <>{children}</>

  return (
    <Tooltip
      aria-label={`Tooltip: ${label}`}
      fontSize='md'
      hasArrow
      label={label}
      zIndex={zIndex}
      {...p}
    >
      {children}
    </Tooltip>
  )
}
