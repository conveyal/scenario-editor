import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  ButtonProps,
  useDisclosure
} from '@chakra-ui/react'
import {useRef, useState} from 'react'

type ConfirmButtonProps = ButtonProps & {
  description: string
  onConfirm: () => void
}

/**
 * Button that opens a dialog for confirming the action taken by the button.
 */
export default function ConfirmButton({
  children,
  description,
  onConfirm,
  ...p
}: ConfirmButtonProps) {
  const {isOpen, onOpen, onClose} = useDisclosure()

  return (
    <>
      <Button {...p} onClick={onOpen}>
        {children}
      </Button>

      {isOpen && (
        <ConfirmDialog
          action={p.title || children}
          description={description}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </>
  )
}

export function ConfirmDialog({action, description, onClose, onConfirm}) {
  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef()

  function doAction() {
    setConfirming(true)
    onConfirm()
  }

  return (
    <AlertDialog
      isOpen
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      size='lg'
    >
      <AlertDialogOverlay />
      <AlertDialogContent borderRadius='md'>
        <AlertDialogHeader fontSize='xl' fontWeight='bold'>
          Confirm
        </AlertDialogHeader>
        <AlertDialogBody fontSize='lg'>{description}</AlertDialogBody>
        <AlertDialogFooter>
          <Button
            isDisabled={confirming}
            onClick={onClose}
            ref={cancelRef}
            size='lg'
          >
            Cancel
          </Button>
          <Button
            isLoading={confirming}
            ml={3}
            onClick={doAction}
            size='lg'
            colorScheme='red'
          >
            Confirm: {action}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
