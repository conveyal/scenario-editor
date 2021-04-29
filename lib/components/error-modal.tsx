import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  Stack,
  Text
} from '@chakra-ui/react'
import {useState} from 'react'
import {FallbackProps} from 'react-error-boundary'

import {ExternalLink} from 'lib/components/link'

const title = 'Unfortunately it appears an error has occured..'

function StackTrace({stackTrace, ...p}) {
  // Hide the stack trace in production
  const [show, setShow] = useState(process.env.NODE_ENV !== 'production')
  const handleToggle = () => setShow((show) => !show)

  return (
    <Stack spacing={4} {...p}>
      <Button onClick={handleToggle} colorScheme='blue'>
        {show ? 'Hide' : 'Show'} stack trace
      </Button>
      <Collapse in={show}>
        <Box
          fontFamily='mono'
          overflowX='scroll'
          whiteSpace='pre'
          padding={2}
          bg='gray.800'
          color='white'
        >
          {stackTrace}
        </Box>
      </Collapse>
    </Stack>
  )
}

export default function ErrorModal({error, resetErrorBoundary}: FallbackProps) {
  const errorMessage = typeof error === 'string' ? error : error.message
  const stack = error.stack

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={!!error}
      onClose={() => resetErrorBoundary()}
      size='2xl'
    >
      <ModalOverlay />
      <ModalContent borderRadius='4px'>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <Text>{errorMessage}</Text>
            {stack && <StackTrace stackTrace={stack} />}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              resetErrorBoundary()
              window.history.back()
            }}
            colorScheme='yellow'
          >
            Go back
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
