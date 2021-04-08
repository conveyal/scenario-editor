import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from '@chakra-ui/react'
import {useProject} from 'lib/hooks/use-model'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import ConfirmButton from './confirm-button'
import {DeleteIcon, EditIcon} from './icons'
import InnerDock from './inner-dock'
import {ALink} from './link'
import useControlledInput from 'lib/hooks/use-controlled-input'

type EditProjectProps = {
  project: CL.Project
  query: CL.Query
}

const nameIsValid = (n?: string): boolean => n?.length > 0

export default function EditProject(p: EditProjectProps) {
  const {projectId, regionId} = p.query
  const {data: project, remove, update} = useProject(projectId)
  const nameInput = useControlledInput({
    test: nameIsValid,
    value: project?.name
  })
  const routeToProjects = useRouteTo('projects', {regionId})
  const routeToModifications = useRouteTo('modifications', {
    projectId,
    regionId
  })

  async function _deleteProject() {
    await remove()
    routeToProjects()
  }

  async function _save() {
    await update({name: nameInput.value})
    routeToModifications()
  }

  return (
    <InnerDock>
      <Stack p={4} spacing={4}>
        <Heading mb={4} size='md'>
          {message('project.editSettings')}
        </Heading>
        <FormControl isInvalid={nameInput.isInvalid} isRequired>
          <FormLabel htmlFor={nameInput.id}>
            {message('project.name')}
          </FormLabel>
          <Input {...nameInput} />
        </FormControl>
        <Stack spacing={2}>
          <Heading size='sm'>Bundle</Heading>
          <Box>
            Bundle cannot be changed once a project is created.&nbsp;
            <ALink
              to='bundle'
              query={{
                bundleId: project?.bundleId,
                regionId: project?.regionId
              }}
            >
              View bundle info here.
            </ALink>
          </Box>
        </Stack>
        <Button
          leftIcon={<EditIcon />}
          isDisabled={nameInput.isInvalid || project.name === nameInput.value}
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
