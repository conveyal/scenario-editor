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
} from '@chakra-ui/core'

import {faPrint} from '@fortawesome/free-solid-svg-icons'
import {useSelector} from 'react-redux'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import {
  downloadLines,
  downloadScenario,
  downloadStops
} from 'lib/utils/export-project'

import Icon from './icon'

function mapState(state) {
  const {feeds, modifications} = state.project
  return {feeds, modifications}
}

export default function ExportProject({onHide, project}) {
  return (
    <Modal isOpen={true} onClose={onHide} size='2xl'>
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
  const {feeds, modifications} = useSelector(mapState)

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
          leftIcon='download'
          onClick={_downloadScenario}
          variantColor='blue'
        >
          {message('variant.saveJson')}
        </Button>
        <Button onClick={goToReport} variantColor='blue'>
          <Icon icon={faPrint} />
          &nbsp;&nbsp;{message('variant.print')}
        </Button>
        <Button
          leftIcon='download'
          onClick={_downloadLines}
          variantColor='blue'
        >
          {message('variant.saveGeojson')}
        </Button>
        <Button
          leftIcon='download'
          onClick={_downloadStops}
          variantColor='blue'
        >
          {message('variant.saveStops')}
        </Button>
      </SimpleGrid>
    </Stack>
  )
}
