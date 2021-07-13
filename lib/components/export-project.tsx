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

import {DownloadIcon, PrintIcon} from 'lib/components/icons'
import {useScenarios} from 'lib/hooks/use-collection'
import {useBundle} from 'lib/hooks/use-model'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import {
  downloadLines,
  downloadScenario,
  downloadStops
} from 'lib/utils/export-project'
import useModificationsForScenario from 'lib/modification/hooks/use-modifications-for-scenario'
import cleanProjectScenarioName from 'lib/utils/clean-project-scenario-name'

export default function ExportProject({
  onHide,
  project
}: {
  onHide: () => void
  project: CL.Project
}) {
  const {data: bundle} = useBundle(project.bundleId)
  const {data: scenarios} = useScenarios({query: {projectId: project._id}})
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={true}
      onClose={onHide}
      size='2xl'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{message('scenario.export')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4} pb={6}>
            <Box>{message('scenario.exportExplanation')}</Box>
            {scenarios.map((scenario, index) => (
              <Box key={scenario._id}>
                <Variant
                  bundle={bundle}
                  index={index}
                  project={project}
                  scenario={scenario}
                />
              </Box>
            ))}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function Variant({
  bundle,
  index,
  project,
  scenario
}: {
  bundle: CL.Bundle
  index: number
  project: CL.Project
  scenario: CL.Scenario
}) {
  const goToReport = useRouteTo('report', {
    projectId: project._id,
    regionId: project.regionId,
    scenarioId: scenario._id
  })
  const modifications = useModificationsForScenario(scenario._id)
  const cleanedName = cleanProjectScenarioName(project, scenario.name)

  function _downloadLines() {
    downloadLines(cleanedName, modifications)
  }

  function _downloadScenario() {
    downloadScenario(cleanedName, bundle.feeds, modifications)
  }

  function _downloadStops() {
    downloadStops(cleanedName, modifications)
  }

  return (
    <Stack spacing={2}>
      <Heading size='sm'>
        {index + 1}. {scenario.name}
      </Heading>
      <SimpleGrid columns={2} spacing={1}>
        <Button
          leftIcon={<DownloadIcon />}
          onClick={_downloadScenario}
          colorScheme='blue'
        >
          {message('scenario.saveJson')}
        </Button>
        <Button
          leftIcon={<PrintIcon />}
          onClick={goToReport}
          colorScheme='blue'
        >
          {message('scenario.print')}
        </Button>
        <Button
          leftIcon={<DownloadIcon />}
          onClick={_downloadLines}
          colorScheme='blue'
        >
          {message('scenario.saveGeojson')}
        </Button>
        <Button
          leftIcon={<DownloadIcon />}
          onClick={_downloadStops}
          colorScheme='blue'
        >
          {message('scenario.saveStops')}
        </Button>
      </SimpleGrid>
    </Stack>
  )
}
