import {Badge, Box, Heading, Stack} from '@chakra-ui/react'

import InnerDock from 'lib/components/inner-dock'
import TaskList from 'lib/components/task-list'
import useActivity from 'lib/hooks/use-activity'
import withDataLayout from 'lib/with-data-layout'

function UserActivityPage() {
  const {tasks} = useActivity()
  return (
    <InnerDock width={640}>
      <Stack py={5} px={2} spacing={4}>
        <Heading px={3} size='md'>
          <>Activity</>
          <Badge ml={2} fontSize='0.8em'>
            {tasks.length}
          </Badge>
        </Heading>
        <Box>
          <TaskList />
        </Box>
      </Stack>
    </InnerDock>
  )
}

export default withDataLayout(UserActivityPage, () => ({}))
