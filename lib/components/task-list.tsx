import {
  Box,
  Heading,
  HStack,
  Progress,
  Stack,
  StackDivider
} from '@chakra-ui/react'
import formatDate from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import {useEffect, useState} from 'react'

import {CheckIcon, ErrorIcon, ExternalLinkIcon} from 'lib/components/icons'
import IconButton from 'lib/components/icon-button'
import {ALink} from 'lib/components/link'
import useActivity from 'lib/hooks/use-activity'
// import useRouteTo from 'lib/hooks/use-route-to'

const px = 3
const py = 4

const taskIsFinished = (t: CL.Task) => t.state === 'DONE' || t.state === 'ERROR'

function getColor(task: CL.Task): string {
  switch (task.state) {
    case 'ACTIVE':
      return 'green.500'
    case 'QUEUED':
      return 'inherit'
    case 'ERROR':
      return 'red.500'
    case 'DONE':
      return 'blue.500'
  }
}

function getTime(task: CL.Task): string {
  switch (task.state) {
    case 'ACTIVE':
      return formatDate(
        Date.now() - 1617850570880 /* TODO use task.timeBegan */,
        'HH:mm:ss'
      )
    case 'QUEUED':
      return 'in queue'
    case 'DONE':
    case 'ERROR':
      return formatDistanceToNow(task.timeCompleted || Date.now(), {
        addSuffix: true
      })
  }
}

function TaskTime({task}: {task: CL.Task}) {
  const [time, setTime] = useState(getTime(task))

  useEffect(() => {
    const id = setInterval(() => setTime(getTime(task)), 1000)
    return () => clearInterval(id)
  }, [task])

  return <>{time}</>
}

interface TaskProps {
  removeTask: (id: string) => void
  task: CL.Task
}

function Task({removeTask, task, ...p}: TaskProps) {
  const goToWorkProduct = () => {}
  return (
    <Stack px={px} py={py} position='relative' spacing={1} {...p}>
      <HStack justify='space-between'>
        <HStack color={getColor(task)}>
          {task.state === 'ERROR' && <ErrorIcon />}
          <Heading
            size='sm'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
            overflow='hidden'
            _hover={{
              whiteSpace: 'normal'
            }}
          >
            {task.title}
          </Heading>
        </HStack>
        <HStack>
          <IconButton
            colorScheme={task.state === 'ERROR' ? 'red' : 'blue'}
            visibility={taskIsFinished(task) ? 'inherit' : 'hidden'}
            label={
              task.state === 'ERROR'
                ? 'View error details'
                : 'View work product'
            }
            onClick={() => goToWorkProduct()}
          >
            <ExternalLinkIcon />
          </IconButton>
          <IconButton
            visibility={taskIsFinished(task) ? 'inherit' : 'hidden'}
            label='Done'
            onClick={() => removeTask(task.id)}
          >
            <CheckIcon />
          </IconButton>
        </HStack>
      </HStack>
      <HStack justify='space-between' spacing={6}>
        <Box
          textOverflow='ellipsis'
          whiteSpace='nowrap'
          overflow='hidden'
          _hover={{
            whiteSpace: 'normal'
          }}
        >
          {task.detail}
        </Box>
        <Box fontFamily='mono' opacity={0.6} whiteSpace='nowrap'>
          <TaskTime task={task} />
        </Box>
      </HStack>
      {task.state === 'ACTIVE' && (
        <Box>
          <Progress
            colorScheme='green'
            hasStripe
            isAnimated
            mt={2}
            value={task.percentComplete}
          />
        </Box>
      )}
    </Stack>
  )
}

interface TaskListProps {
  limit?: number
  regionId: string
}

export default function TaskList({limit, regionId}: TaskListProps) {
  const {tasks, removeTask} = useActivity()
  return (
    <Stack divider={<StackDivider />} spacing={0}>
      {tasks.length > 0 ? (
        tasks
          .slice(0, limit)
          .map((task) => (
            <Task key={task.id} removeTask={removeTask} task={task} />
          ))
      ) : (
        <Box px={px} py={py}>
          No active tasks.
        </Box>
      )}
      {limit < tasks.length && (
        <Box px={px} py={py}>
          <ALink to='activity' query={{regionId}}>
            View more tasks →
          </ALink>
        </Box>
      )}
    </Stack>
  )
}
