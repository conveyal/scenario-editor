import {Box, Button, Heading, Stack, useToast} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import {useState} from 'react'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import copyFromProject from 'lib/modification/mutations/copy-from-project'

import Link from './link'
import Select from './select'

const getName = fpGet('name')
const getId = fpGet('_id')

export default function ImportModifications({projects, project}) {
  const [importProject, setImportProject] = useState<CL.Project>(null)
  const routeToQuery = {
    projectId: project._id,
    regionId: project.regionId
  }
  const routeToModifications = useRouteTo('modifications', routeToQuery)
  const toast = useToast({position: 'top', status: 'success'})
  const [copyInProgress, setCopyInProgress] = useState(false)

  /**
   * Create modifications by copying from the selected project and then redirect
   * to the project's modification list page.
   */
  async function _copyFromProject() {
    setCopyInProgress(true)
    const res = await copyFromProject(importProject, project)
    setCopyInProgress(false)
    if (res.ok) {
      toast({
        title: 'Copied modifications successfully'
      })
      routeToModifications()
    } else if (res.ok === false) {
      toast({
        title: 'Error while copying modifications',
        description: res.error.message,
        status: 'error'
      })
    }
  }

  return (
    <Stack p={4} spacing={4}>
      <Heading size='md'>{message('modification.importFromShapefile')}</Heading>
      <Link to='importShapefile' query={routeToQuery}>
        <Button colorScheme='green'>Import from Shapefile</Button>
      </Link>
      <Heading size='md'>{message('modification.importFromProject')}</Heading>
      <Box>{message('modification.importFromProjectInfo')}</Box>
      <Box>
        <Select
          getOptionLabel={getName}
          getOptionValue={getId}
          onChange={(p) => setImportProject(p)}
          options={projects}
          placeholder={message('project.select')}
          value={importProject}
        />
      </Box>
      <Button
        isDisabled={importProject == null}
        isLoading={copyInProgress}
        onClick={_copyFromProject}
        colorScheme='green'
      >
        Import from existing project
      </Button>
    </Stack>
  )
}
