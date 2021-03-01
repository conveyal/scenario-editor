import {Tooltip, TooltipProps} from '@chakra-ui/react'
import {forwardRef} from 'react'

const zIndex = 1500 // Chakra modals are set to 1400

type TipProps = Omit<TooltipProps, 'aria-label'> & {
  isDisabled?: boolean
}

// Common Tooltip defaults used acrossed the application
const Tip = forwardRef<HTMLDivElement, TipProps>(
  ({children, isDisabled = false, label, ...p}, ref) => {
    if (isDisabled) return <>{children}</>

    return (
      <Tooltip
        aria-label={`Tooltip: ${label}`}
        fontSize='md'
        hasArrow
        label={label}
        ref={ref}
        zIndex={zIndex}
        {...p}
      >
        {children}
      </Tooltip>
    )
  }
)

export default Tip
