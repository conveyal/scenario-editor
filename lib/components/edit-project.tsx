import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from '@chakra-ui/react'
import {useState} from 'react'
import {useDispatch} from 'react-redux'

import {deleteProject, saveToServer} from 'lib/actions/project'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import ConfirmButton from './confirm-button'
import {DeleteIcon, EditIcon} from './icons'
import InnerDock from './inner-dock'
import {ALink} from './link'

export default function EditProject({project, query}) {
  const dispatch = useDispatch<any>()
  const [name, setName] = useState(project.name)
  const {projectId, regionId} = query
  const routeToProjects = useRouteTo('projects', {regionId})
  const routeToModifications = useRouteTo('modifications', {
    projectId,
    regionId
  })

  function _deleteProject() {
    dispatch(deleteProject(projectId)).then(() => routeToProjects())
  }

  function _save() {
    dispatch(saveToServer({...project, name})).then(() =>
      routeToModifications()
    )
  }

  return (
    <InnerDock>
      <Stack p={4} spacing={4}>
        <Heading mb={4} size='md'>
          {message('project.editSettings')}
        </Heading>
        <FormControl isInvalid={!name || name.length === 0}>
          <FormLabel htmlFor='projectName'>{message('project.name')}</FormLabel>
          <Input
            id='projectName'
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </FormControl>
        <Stack spacing={2}>
          <Heading size='sm'>Bundle</Heading>
          <Box>
            Bundle cannot be changed once a project is created.&nbsp;
            <ALink
              to='bundleEdit'
              bundleId={project.bundleId}
              regionId={project.regionId}
            >
              View bundle info here.
            </ALink>
          </Box>
        </Stack>
        <Button
          leftIcon={<EditIcon />}
          isDisabled={!name || project.name === name}
          onClick={_save}
          colorScheme='green'
        >
          {message('project.editAction')}
        </Button>
        <ConfirmButton
          description={message('project.deleteConfirmation')}
          leftIcon={<DeleteIcon />}
          onConfirm={_deleteProject}
          colorScheme='red'
        >
          {message('project.delete')}
        </ConfirmButton>
      </Stack>
    </InnerDock>
  )
}
