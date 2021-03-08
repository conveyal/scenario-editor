import {
  Button,
  ButtonProps,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  PortalManager
} from '@chakra-ui/react'
import {ReactNode, useEffect, useRef, useState} from 'react'

import {POPOVER_Z} from 'lib/constants/z-index'

type ConfirmProps = {
  children: ReactNode
  description: string
  onConfirm: () => unknown | Promise<unknown>
}

/**
 * Button that opens a dialog for confirming the action taken by the button.
 */
export default function ConfirmButton({
  children,
  description,
  onConfirm,
  ...p
}: ButtonProps & ConfirmProps) {
  return (
    <ConfirmDialog description={description} onConfirm={onConfirm}>
      <Button {...p}>{children}</Button>
    </ConfirmDialog>
  )
}

export function ConfirmDialog({
  children,
  description,
  onConfirm
}: ConfirmProps) {
  const isMounted = useRef(true)
  const [confirming, setConfirming] = useState(false)

  // Set to false on unmount
  useEffect(
    () => () => {
      isMounted.current = false
    },
    []
  )

  return (
    <PortalManager zIndex={POPOVER_Z}>
      <Popover isLazy>
        {({onClose}) => (
          <>
            <PopoverTrigger>{children}</PopoverTrigger>
            <Portal>
              <PopoverContent>
                <PopoverHeader fontSize='lg' fontWeight='bold'>
                  Confirm
                </PopoverHeader>
                <PopoverCloseButton />
                <PopoverBody>{description}</PopoverBody>
                <PopoverFooter textAlign='right'>
                  <Button
                    colorScheme='red'
                    isLoading={confirming}
                    onClick={async () => {
                      setConfirming(true)
                      await onConfirm()
                      if (isMounted.current) {
                        onClose()
                      }
                    }}
                    size='lg'
                  >
                    Confirm
                  </Button>
                </PopoverFooter>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    </PortalManager>
  )
}
