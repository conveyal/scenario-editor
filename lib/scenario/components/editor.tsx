import {
  Box,
  Button,
  Divider,
  Flex,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react'

import {ConfirmDialog} from 'lib/components/confirm-button'
import Editable from 'lib/components/editable'
import IconButton from 'lib/components/icon-button'
import {CopyIcon, DeleteIcon, LockIcon, ShowIcon} from 'lib/components/icons'
import InnerDock from 'lib/components/inner-dock'
import Tip from 'lib/components/tip'
import {useScenarios} from 'lib/hooks/use-collection'
import message from 'lib/message'
import {SafeResponse} from 'lib/utils/safe-fetch'

import useCopyScenario from '../hooks/use-copy-scenario'
import useShowScenarioModifications from '../hooks/use-show-scenario-modifications'
import removeScenarioModifications from '../mutations/remove-scenarios-modifications'

const isValidName = (s?: string) => s && s.length > 0

export default function ScenariosEditor(p: {projectId: string}) {
  const toast = useToast({isClosable: true, position: 'top', status: 'error'})
  const scenarios = useScenarios({query: {projectId: p.projectId}})
  const copyScenario = useCopyScenario(scenarios)
  const showScenarioModifications = useShowScenarioModifications()

  async function _copyScenario(scenario: CL.Scenario) {
    try {
      await copyScenario(scenario)
    } catch (e) {
      toast({
        title: 'Error copying scenario',
        description: e.message
      })
    }
  }

  async function _showScenario(scenario: CL.Scenario) {
    try {
      await showScenarioModifications(scenario)
    } catch (e) {
      toast({
        title: 'Error showing scenario',
        description: e.message
      })
    }
  }

  return (
    <>
      <Box p={2}>
        <Button
          isFullWidth
          onClick={() =>
            scenarios.create({
              name: `${message('scenario.name')} ${scenarios.data.length + 1}`,
              projectId: p.projectId
            })
          }
          colorScheme='green'
        >
          {message('scenario.createAction')}
        </Button>
      </Box>
      <Stack py={2}>
        <Text px={4} py={2}>
          {message('scenario.description')}
        </Text>

        <Divider mx={4} />

        <InnerDock>
          <Stack spacing={3} pt={2} pl={4} pr={2} id='scenarios'>
            <Flex pr={2}>
              <Text flex='1' fontWeight='bold'>
                {message('scenario.baseline')}
              </Text>
              <Tip label='Baseline (empty scenario) cannot be modified'>
                <span>
                  <LockIcon />
                </span>
              </Tip>
            </Flex>
            {scenarios.data.map((scenario, index) => (
              <Box key={index}>
                <Scenario
                  scenario={scenario}
                  copyScenario={() => _copyScenario(scenario)}
                  deleteScenario={async () => {
                    await removeScenarioModifications(scenario)
                    return await scenarios.remove(scenario._id)
                  }}
                  index={index}
                  onChangeName={(name: string) =>
                    scenarios.update(scenario._id, {name})
                  }
                  showScenario={() => _showScenario(scenario)}
                />
              </Box>
            ))}
          </Stack>
        </InnerDock>
      </Stack>
    </>
  )
}

function Scenario(p: {
  copyScenario: () => void
  deleteScenario: () => Promise<SafeResponse<CL.Scenario>>
  index: number
  onChangeName: (name: string) => Promise<SafeResponse<CL.Scenario[]>>
  scenario: CL.Scenario
  showScenario: () => void
}) {
  return (
    <Flex align='center'>
      <Text mr={2}>{p.index + 1}.</Text>
      <Box flex='1' fontWeight='bold'>
        <Editable
          isValid={isValidName}
          onChange={p.onChangeName}
          value={p.scenario.name}
        />
      </Box>
      <Stack isInline spacing={0}>
        {p.index !== 0 && (
          <ConfirmDialog
            description={message('scenario.deleteConfirmation')}
            onConfirm={p.deleteScenario}
          >
            <IconButton label={message('scenario.delete')} colorScheme='red'>
              <DeleteIcon />
            </IconButton>
          </ConfirmDialog>
        )}
        <IconButton label='Copy scenario' onClick={p.copyScenario}>
          <CopyIcon />
        </IconButton>
        <IconButton
          label={message('scenario.showModifications')}
          onClick={p.showScenario}
        >
          <ShowIcon />
        </IconButton>
      </Stack>
    </Flex>
  )
}
