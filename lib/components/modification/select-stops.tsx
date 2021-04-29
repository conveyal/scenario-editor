import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  List,
  ListItem,
  Stack,
  Heading
} from '@chakra-ui/react'
import {useState} from 'react'
import {useSelector} from 'react-redux'

import message from 'lib/message'
import selectSelectedStops from 'lib/selectors/selected-stops'

import IconButton from '../icon-button'
import {ClearIcon, EditIcon, MinusSquare, PlusSquare, XIcon} from '../icons'
import StopSelectPolygon from '../modifications-map/stop-select-polygon'

type Action = 'none' | 'new' | 'add' | 'remove'

/**
 * Select stops on a particular route
 */
export default function SelectStops({modification, update}) {
  const [action, setAction] = useState<Action>('none')
  const selectedStops = useSelector(selectSelectedStops)

  function onClear() {
    update({stops: null})
    setAction('none')
  }

  return (
    <Stack spacing={4}>
      {action !== 'none' ? (
        <Box>
          <StopSelectPolygon
            action={action}
            currentStops={modification.stops}
            update={(stops) => {
              update({stops})
              setAction('none')
            }}
          />
          <Button
            leftIcon={<XIcon />}
            isFullWidth
            onClick={() => setAction('none')}
            colorScheme='yellow'
          >
            Cancel
          </Button>
        </Box>
      ) : selectedStops.length < 1 ? (
        <Stack spacing={4}>
          <Alert status='info'>
            <AlertIcon /> {message('modification.selectStopInstructions')}
          </Alert>
          <Button
            leftIcon={<EditIcon />}
            isFullWidth
            onClick={() => setAction('new')}
            colorScheme='blue'
          >
            New
          </Button>
        </Stack>
      ) : (
        <Stack spacing={4}>
          <Flex justify='space-between'>
            <IconButton
              label={message('common.addTo')}
              onClick={() => setAction('add')}
              size='lg'
            >
              <PlusSquare />
            </IconButton>
            <IconButton
              label={message('common.removeFrom')}
              onClick={() => setAction('remove')}
              size='lg'
              colorScheme='yellow'
            >
              <MinusSquare />
            </IconButton>
            <IconButton
              label={message('common.clear')}
              onClick={onClear}
              size='lg'
              colorScheme='red'
            >
              <ClearIcon />
            </IconButton>
          </Flex>
          <Heading size='sm'>Selected stops ({selectedStops?.length})</Heading>
          <SelectedStops selectedStops={selectedStops} />
        </Stack>
      )}
    </Stack>
  )
}

function SelectedStops({selectedStops}) {
  return (
    <List styleType='disc' pl={6}>
      {selectedStops.map((stop) => (
        <ListItem data-id={stop.stop_id} key={stop.stop_id}>
          {stop.stop_name}
        </ListItem>
      ))}
    </List>
  )
}
