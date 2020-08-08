import {Flex, Heading, useDisclosure} from '@chakra-ui/core'
import {
  faChevronLeft,
  faCog,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import ExportProject from './export-project'
import IconButton from './icon-button'

export default function ProjectTitle({project}) {
  const exportSelect = useDisclosure()
  const goToAllProjects = useRouteTo('projects', {
    regionId: project.regionId
  })
  const goToProjectSettings = useRouteTo('projectSettings', {
    regionId: project.regionId,
    projectId: project._id
  })

  const name = project ? project.name : 'Loading...'
  return (
    <Flex align='center' borderBottom='1px solid #E2E8F0' p={2} width='320px'>
      <IconButton
        icon={faChevronLeft}
        label='All projects'
        onClick={goToAllProjects}
      />
      <Heading
        ml={2}
        flex='1'
        size='md'
        overflow='hidden'
        style={{textOverflow: 'ellipsis'}}
        whiteSpace='nowrap'
      >
        {name}
      </Heading>
      {project && (
        <Flex>
          <IconButton
            icon={faExternalLinkAlt}
            label={message('project.export')}
            onClick={exportSelect.onOpen}
          />
          <IconButton
            icon={faCog}
            label={message('project.editSettings')}
            onClick={goToProjectSettings}
          />

          {exportSelect.isOpen && (
            <ExportProject onHide={exportSelect.onClose} project={project} />
          )}
        </Flex>
      )}
    </Flex>
  )
}
