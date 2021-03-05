import {
  Box,
  Button,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Stack,
  SimpleGrid
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import {useSelector} from 'react-redux'

import {DownloadIcon, PrintIcon} from 'lib/components/icons'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import {
  downloadLines,
  downloadScenario,
  downloadStops
} from 'lib/utils/export-project'

const selectFeeds = fpGet('project.feeds')
const selectModifications = fpGet('project.modifications')

export default function ExportProject({onHide, project}) {
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={true}
      onClose={onHide}
      size='2xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{message('variant.export')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4} pb={6}>
            <Box>{message('variant.exportExplanation')}</Box>
            {project.variants.map((name, index) => (
              <Box key={index}>
                <Variant
                  index={index}
                  key={index}
                  name={name}
                  project={project}
                />
              </Box>
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function Variant({index, name, project}) {
  const goToReport = useRouteTo('report', {
    index,
    projectId: project._id,
    regionId: project.regionId
  })
  const feeds = useSelector(selectFeeds)
  const modifications = useSelector(selectModifications)

  function _downloadLines() {
    downloadLines(project, modifications, index)
  }

  function _downloadScenario() {
    downloadScenario(project, feeds, modifications, index)
  }

  function _downloadStops() {
    downloadStops(project, modifications, index)
  }

  return (
    <Stack spacing={2}>
      <Heading size='sm'>
        {index + 1}. {name}
      </Heading>
      <SimpleGrid columns={2} spacing={1}>
        <Button
          leftIcon={<DownloadIcon />}
          onClick={_downloadScenario}
          colorScheme='blue'
        >
          {message('variant.saveJson')}
        </Button>
        <Button
          leftIcon={<PrintIcon />}
          onClick={goToReport}
          colorScheme='blue'
        >
          {message('variant.print')}
        </Button>
        <Button
          leftIcon={<DownloadIcon />}
          onClick={_downloadLines}
          colorScheme='blue'
        >
          {message('variant.saveGeojson')}
        </Button>
        <Button
          leftIcon={<DownloadIcon />}
          onClick={_downloadStops}
          colorScheme='blue'
        >
          {message('variant.saveStops')}
        </Button>
      </SimpleGrid>
    </Stack>
  )
}
