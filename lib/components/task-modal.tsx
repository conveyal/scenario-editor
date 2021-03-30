import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  Progress,
  Stack,
  Text
} from '@chakra-ui/react'
import dateFormat from 'date-fns/format'

const formatTime = (t: number): string => dateFormat(new Date(t), 'HH:mm:ss')

type TaskModalProps = {
  clear: () => void
  children: React.ReactNode
  task: CL.Task
}

export default function TaskModal({clear, children, task}: TaskModalProps) {
  return (
    <Modal
      closeOnEsc={false}
      closeOnOverlayClick={false}
      onClose={clear}
      isOpen={true}
      size='md'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{task.tags.title}</ModalHeader>
        {task.state !== 'ACTIVE' && <ModalCloseButton />}
        <ModalBody>
          <Stack spacing={4}>
            <Stack fontFamily='mono'>
              {task.log.map((l: CL.TaskLogEntry, i: number) => (
                <HStack key={i}>
                  <Text color='gray.500'>[{formatTime(l.time)}]</Text>{' '}
                  <Text>{l.message}</Text>
                </HStack>
              ))}
            </Stack>
            {task.state === 'ACTIVE' && (
              <Progress hasStripe isAnimated value={task.percentComplete} />
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          {task.state === 'DONE'
            ? children
            : task.state === 'ERROR' && (
                <Button isFullWidth onClick={clear} size='lg'>
                  Close
                </Button>
              )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
