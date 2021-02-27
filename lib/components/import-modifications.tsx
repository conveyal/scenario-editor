import {Box, Button, Heading, Stack} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import {useState} from 'react'
import {useDispatch} from 'react-redux'

import {copyFromProject} from 'lib/actions/modifications'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import Link from './link'
import Select from './select'

const getName = fpGet('name')
const getId = fpGet('_id')

export default function ImportModifications({projects, projectId, regionId}) {
  const dispatch = useDispatch<any>()
  const [importProjectId, setImportProjectId] = useState()
  const routeToModifications = useRouteTo('modifications', {
    projectId,
    regionId
  })

  /**
   * Create modifications by copying from the selected project and then redirect
   * to the project's modification list page.
   */
  function _copyFromProject() {
    dispatch(
      copyFromProject({
        fromProjectId: importProjectId,
        toProjectId: projectId
      })
    ).then(() => routeToModifications())
  }

  return (
    <Stack p={4} spacing={4}>
      <Heading size='md'>{message('modification.importFromShapefile')}</Heading>
      <Link to='importShapefile' query={{projectId, regionId}}>
        <Button colorScheme='green'>Import from Shapefile</Button>
      </Link>
      <Heading size='md'>{message('modification.importFromProject')}</Heading>
      <Box>{message('modification.importFromProjectInfo')}</Box>
      <Box>
        <Select
          getOptionLabel={getName}
          getOptionValue={getId}
          onChange={(p) => setImportProjectId(getId(p))}
          options={projects}
          placeholder={message('project.select')}
          value={projects.find((p) => p._id === importProjectId)}
        />
      </Box>
      <Button
        isDisabled={!importProjectId}
        onClick={_copyFromProject}
        colorScheme='green'
      >
        Import from existing project
      </Button>
    </Stack>
  )
}
