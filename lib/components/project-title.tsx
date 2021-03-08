import {Flex, Heading, useDisclosure} from '@chakra-ui/react'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import ExportProject from './export-project'
import IconButton from './icon-button'
import {ChevronLeft, ExternalLinkIcon, SettingsIcon} from './icons'

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
    <Flex align='center' borderBottomWidth='1px' p={2} width='320px'>
      <IconButton label='All projects' onClick={goToAllProjects}>
        <ChevronLeft />
      </IconButton>
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
            label={message('project.export')}
            onClick={exportSelect.onOpen}
          >
            <ExternalLinkIcon />
          </IconButton>
          <IconButton
            label={message('project.editSettings')}
            onClick={goToProjectSettings}
          >
            <SettingsIcon />
          </IconButton>

          {exportSelect.isOpen && (
            <ExportProject onHide={exportSelect.onClose} project={project} />
          )}
        </Flex>
      )}
    </Flex>
  )
}
