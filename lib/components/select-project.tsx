import {Box, Button, Heading, Stack, Flex} from '@chakra-ui/core'
import {
  faCog,
  faDatabase,
  faCube,
  faMap
} from '@fortawesome/free-solid-svg-icons'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import Icon from './icon'
import IconButton from './icon-button'
import InnerDock from './inner-dock'
import ListGroupItem from './list-group-item'

export default function SelectProject({bundles, projects, region}) {
  const routeToBundleCreate = useRouteTo('bundleCreate', {regionId: region._id})
  const routeToProjectCreate = useRouteTo('projectCreate', {
    regionId: region._id
  })
  const routeToRegionSettings = useRouteTo('regionSettings', {
    regionId: region._id
  })

  return (
    <InnerDock>
      <Stack py={4} spacing={4} px={2}>
        <Flex align='center' pl={2}>
          <Heading flex='1' size='md'>
            <Icon icon={faMap} /> {region.name}
          </Heading>
          <IconButton
            label='Edit region settings'
            icon={faCog}
            onClick={routeToRegionSettings}
          />
        </Flex>

        <Stack px={2}>
          {bundles.length > 0 ? (
            <Button
              isFullWidth
              leftIcon='small-add'
              onClick={routeToProjectCreate}
              variantColor='green'
            >
              {message('project.createAction')}
            </Button>
          ) : (
            <Button
              isFullWidth
              onClick={routeToBundleCreate}
              variantColor='green'
            >
              <Icon icon={faDatabase} />
              &nbsp;&nbsp;{message('project.uploadBundle')}
            </Button>
          )}
        </Stack>

        {projects.length > 0 && (
          <Box textAlign='center'>{message('project.goToExisting')}</Box>
        )}

        <Stack px={2} spacing={0}>
          {projects.map((project) => (
            <Project key={project._id} project={project} />
          ))}
        </Stack>
      </Stack>
    </InnerDock>
  )
}

function Project({project, ...p}) {
  const goToModifications = useRouteTo('modifications', {
    regionId: project.regionId,
    projectId: project._id
  })
  return (
    <ListGroupItem
      leftIcon={() => (
        <Box pr={3}>
          <Icon icon={faCube} />
        </Box>
      )}
      onClick={goToModifications}
      {...p}
    >
      {project.name}
    </ListGroupItem>
  )
}
