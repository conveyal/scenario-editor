import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  useColorModeValue
} from '@chakra-ui/react'
import {dequal} from 'dequal/lite'
import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {setCopyRequestSettings} from 'lib/actions/analysis/profile-request'
import {BASELINE_SCENARIO_ID, BASELINE_SCENARIO} from 'lib/constants'
import {useScenarios} from 'lib/hooks/use-collection'
import useCurrentRegion from 'lib/hooks/use-current-region'
import useOnMount from 'lib/hooks/use-on-mount'
import message from 'lib/message'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import CreateRegional from 'lib/regional/components/create'
import selectProfileRequestLonLat from 'lib/selectors/profile-request-lonlat'
import selectProfileRequestHasChanged from 'lib/selectors/profile-request-has-changed'
import cleanProjectScenarioName from 'lib/utils/clean-project-scenario-name'
import {secondsToHhMmString} from 'lib/utils/time'

import ControlledSelect from '../controlled-select'
import {ChevronDown, ChevronUp, CodeIcon, MouseIcon} from '../icons'
import ModeSummary from '../mode-summary'
import Presets from '../presets'

import DownloadMenu from './download-menu'
import ProfileRequestEditor from './profile-request-editor'
import AdvancedSettings from './advanced-settings'
import ModeSelector from './mode-selector'
import useProfileRequest from 'lib/hooks/use-profile-request'

const SPACING_XS = 2
const SPACING = 5
const SPACING_LG = 8

const getName = fpGet('name')
const getId = fpGet('_id')

function useIsFetchingIsochrone() {
  const isochroneFetchStatus = useSelector((s) =>
    get(s, 'analysis.isochroneFetchStatus')
  )
  return !!isochroneFetchStatus
}

function useResultsValid(isComparison = false) {
  const settingsHaveChanged = useSelector(selectProfileRequestHasChanged)
  const resultsSettings = useSelector((s) =>
    get(s, 'analysis.resultsSettings', [])
  )
  return !settingsHaveChanged && resultsSettings.length > (isComparison ? 1 : 0)
}

function useOriginLonLat() {
  return useSelector(selectProfileRequestLonLat)
}

export default function Settings({
  currentProject,
  projects
}: {
  currentProject: CL.Project
  projects: CL.Project[]
}) {
  return (
    <>
      <PrimarySettings project={currentProject} projects={projects} />
      <ComparisonSettings projects={projects} />
    </>
  )
}

function PrimarySettings({
  project,
  projects
}: {
  project: CL.Project
  projects: CL.Project[]
}) {
  const dispatch = useDispatch<any>()
  const primaryBorder = useColorModeValue('blue.50', 'blue.900')
  const region = useCurrentRegion()
  const {replace, settings, update} = useProfileRequest(0)
  const {data: scenarios} = useScenarios({query: {projectId: project?._id}})
  const currentScenario =
    scenarios.find((s) => s._id === settings.scenarioId) ?? BASELINE_SCENARIO

  // On initial load, the query string may be out of sync with the requestsSettings.projectId
  useOnMount(() => {
    const projectId = project?._id
    if (projectId != null && projectId !== 'undefined') {
      dispatch(setSearchParameter({projectId}))
      update({projectId})
    }
  })

  // Set the analysis bounds to be the region bounds if bounds do not exist
  useEffect(() => {
    if (!settings.bounds) {
      update({bounds: region.bounds})
    }
  }, [settings, region, update])

  // Current project is stored in the query string
  const _setCurrentProject = useCallback(
    (option: CL.Project) => {
      const projectId = option?._id
      dispatch(setSearchParameter({projectId}))
      update({projectId, scenarioId: BASELINE_SCENARIO_ID})
    },
    [dispatch, update]
  )
  const _setScenario = useCallback(
    (option: CL.Scenario) => update({scenarioId: option._id}),
    [update]
  )

  return (
    <Box
      borderBottomWidth='1px'
      borderTopWidth='1px'
      borderBottomColor={primaryBorder}
      borderTopColor={primaryBorder}
      id='PrimaryAnalysisSettings'
    >
      <RequestHeading
        colorScheme='blue'
        profileRequest={settings}
        project={project}
        scenario={currentScenario}
      />
      <RequestSettings
        colorScheme='blue'
        profileRequest={settings}
        project={project}
        projects={projects}
        replaceSettings={replace}
        scenario={currentScenario}
        scenarios={scenarios}
        setProject={_setCurrentProject}
        setScenario={_setScenario}
        updateProfileRequest={update}
      />
    </Box>
  )
}

function ComparisonSettings({projects}: {projects: CL.Project[]}) {
  const {replace, settings, update} = useProfileRequest(1)
  const comparisonProjectId = settings?.projectId
  const comparisonProject = projects.find((p) => p._id === comparisonProjectId)
  const comparisonBorderColor = useColorModeValue('red.100', 'red.900')
  const {data: scenarios} = useScenarios({
    query: {projectId: comparisonProject?._id}
  })
  const currentScenario =
    scenarios.find((s) => s._id === settings.scenarioId) ?? BASELINE_SCENARIO

  // Current project is stored in the query string
  const _setComparisonProject = useCallback(
    (newProject) => {
      if (!comparisonProject) {
        update({
          ...settings,
          projectId: newProject._id,
          scenarioId: BASELINE_SCENARIO_ID
        })
      } else {
        update({
          projectId: newProject._id,
          scenarioId: BASELINE_SCENARIO_ID
        })
      }
    },
    [comparisonProject, settings, update]
  )
  const _setCurrentScenario = useCallback(
    (option: CL.Scenario) => update({scenarioId: option._id}),
    [update]
  )

  return (
    <Box
      borderBottomWidth='1px'
      borderTopWidth='1px'
      borderBottomColor={comparisonBorderColor}
      borderTopColor={comparisonBorderColor}
      id='PrimaryAnalysisSettings'
    >
      <RequestHeading
        colorScheme='red'
        isComparison
        profileRequest={settings}
        project={comparisonProject}
        scenario={currentScenario}
      />
      <RequestSettings
        colorScheme='red'
        isComparison
        profileRequest={settings}
        project={comparisonProject}
        projects={projects}
        replaceSettings={replace}
        scenario={currentScenario}
        scenarios={scenarios}
        setProject={_setComparisonProject}
        setScenario={_setCurrentScenario}
        updateProfileRequest={update}
      />
    </Box>
  )
}

function RequestSummary({color, profileRequest, ...p}) {
  return (
    <Flex flex='2' justify='space-evenly' {...p}>
      <ModeSummary
        accessModes={profileRequest.accessModes}
        color={color}
        egressModes={profileRequest.egressModes}
        transitModes={profileRequest.transitModes}
      />

      <Stack fontWeight='500' isInline spacing={SPACING_XS}>
        <Text>{profileRequest.date}</Text>
        <Text>
          {secondsToHhMmString(profileRequest.fromTime, false)}-
          {secondsToHhMmString(profileRequest.toTime, false)}
        </Text>
      </Stack>
    </Flex>
  )
}

function RequestHeading({
  colorScheme,
  isComparison = false,
  profileRequest,
  project,
  scenario
}: {
  colorScheme: string
  isComparison?: boolean
  profileRequest: CL.ProfileRequest
  project: CL.Project
  scenario: CL.Scenario
}) {
  const opportunityDataset = useSelector(activeOpportunityDataset)
  const projectDownloadName = cleanProjectScenarioName(project, scenario.name)
  const resultsAreValid = useResultsValid(isComparison)

  return (
    <Flex
      align='center'
      px={SPACING}
      pt={SPACING_LG}
      pb={SPACING_XS}
      justify='space-between'
      textAlign='left'
    >
      {project ? (
        <>
          <Stack flex='1' overflow='hidden'>
            <Heading size='md' color={`${colorScheme}.500`} overflow='hidden'>
              {project.name}
            </Heading>
            <Heading size='sm' color='gray.500' overflow='hidden'>
              {scenario?.name}
            </Heading>
          </Stack>

          {isComparison ? (
            profileRequest && (
              <RequestSummary
                color={colorScheme}
                profileRequest={profileRequest}
                flex='2'
              />
            )
          ) : (
            <RequestSummary
              color={colorScheme}
              profileRequest={profileRequest}
              flex='2'
            />
          )}
        </>
      ) : (
        <Heading size='md' color={`${colorScheme}.500`}>
          Select a {isComparison ? 'comparison ' : ''}project
        </Heading>
      )}

      <Stack spacing={SPACING_XS} isInline shouldWrapChildren>
        <DownloadMenu
          isComparison={isComparison}
          isDisabled={!resultsAreValid}
          key={colorScheme}
          opportunityDataset={opportunityDataset}
          projectId={get(project, '_id')}
          projectName={projectDownloadName}
          scenarioId={scenario?._id}
        />
        <CreateRegional
          isComparison={isComparison}
          isDisabled={!resultsAreValid}
          projectId={get(project, '_id')}
          scenarioId={scenario?._id}
        />
      </Stack>
    </Flex>
  )
}

function RequestSettings({
  colorScheme,
  copyRequestSettings = false,
  isComparison = false,
  profileRequest,
  project,
  projects,
  replaceSettings,
  scenario,
  scenarios,
  setProject,
  setScenario,
  updateProfileRequest
}) {
  const isFetchingIsochrone = useIsFetchingIsochrone()
  const isDisabled = isFetchingIsochrone || !project
  const profileRequestLonLat = useOriginLonLat()
  // Manually control tabs in order to control when tab contents is rendered.
  const [tabIndex, setTabIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(!project)
  const dispatch = useDispatch()
  const scenarioOptions = useMemo(() => {
    return [BASELINE_SCENARIO, ...scenarios]
  }, [scenarios])

  return (
    <Stack spacing={0}>
      {isOpen && (
        <Stack spacing={SPACING} p={SPACING}>
          <Stack isInline spacing={SPACING}>
            <ControlledSelect
              flex='1'
              getOptionLabel={getName}
              getOptionValue={getId}
              isClearable={isComparison}
              isDisabled={projects.length === 0 || isFetchingIsochrone}
              label={message('common.project')}
              onChange={setProject}
              options={projects}
              value={project}
            />

            <ControlledSelect
              flex='1'
              getOptionLabel={getName}
              getOptionValue={getId}
              isDisabled={isDisabled}
              key={get(project, '_id')}
              label={message('common.scenario')}
              onChange={setScenario}
              options={scenarioOptions}
              value={scenarioOptions.find((s) => s._id === scenario?._id)}
            />

            <Box flex='1'>
              <Presets
                currentSettings={profileRequest}
                currentLonLat={profileRequestLonLat}
                isComparison={isComparison}
                isDisabled={isDisabled}
                onChange={(preset) => {
                  if (isComparison) dispatch(setCopyRequestSettings(false))
                  updateProfileRequest(preset)
                }}
              />
            </Box>
          </Stack>

          {isComparison && (
            <FormControl
              display='flex'
              alignContent='center'
              justifyContent='center'
              isDisabled={!project}
            >
              <FormLabel htmlFor='copySettings' mb={0}>
                Identical request settings
              </FormLabel>
              <Switch
                id='copySettings'
                isChecked={copyRequestSettings}
                isDisabled={!project}
                onChange={(e) =>
                  dispatch(setCopyRequestSettings(get(e, 'target.checked')))
                }
              />
            </FormControl>
          )}

          {project && !copyRequestSettings && (
            <Tabs
              align='end'
              colorScheme={colorScheme}
              index={tabIndex}
              onChange={setTabIndex}
              variant='soft-rounded'
              isLazy
            >
              <TabPanels>
                <TabPanel p={0}>
                  {tabIndex === 0 && (
                    <Stack spacing={SPACING}>
                      <ModeSelector
                        accessModes={profileRequest.accessModes}
                        color={colorScheme}
                        directModes={profileRequest.directModes}
                        disabled={isDisabled}
                        egressModes={profileRequest.egressModes}
                        transitModes={profileRequest.transitModes}
                        update={updateProfileRequest}
                      />

                      <ProfileRequestEditor
                        disabled={isDisabled}
                        profileRequest={profileRequest}
                        project={project}
                        updateProfileRequest={updateProfileRequest}
                      />

                      <AdvancedSettings
                        disabled={isDisabled}
                        profileRequest={profileRequest}
                        updateProfileRequest={updateProfileRequest}
                      />
                    </Stack>
                  )}
                </TabPanel>
                <TabPanel p={0}>
                  {tabIndex === 1 && (
                    <JSONEditor
                      isDisabled={isDisabled}
                      profileRequest={profileRequest}
                      replaceSettings={replaceSettings}
                    />
                  )}
                </TabPanel>
              </TabPanels>

              <TabList mt={4}>
                <Tab title='Form editor'>
                  <MouseIcon />
                </Tab>
                <Tab title='Custom JSON editor'>
                  <CodeIcon />
                </Tab>
              </TabList>
            </Tabs>
          )}
        </Stack>
      )}
      <Button
        borderRadius='0'
        _focus={{
          outline: 'none'
        }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
        size='sm'
        title={isOpen ? 'collapse' : 'expand'}
        variant='ghost'
        colorScheme={colorScheme}
        width='100%'
      >
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </Button>
    </Stack>
  )
}

const isJSONValid = (jsonString: string) => {
  try {
    JSON.parse(jsonString)
  } catch (e) {
    return false
  }
  return true
}

const JSONEditor = memo<{
  isDisabled: boolean
  profileRequest: Record<string, unknown>
  replaceSettings: (newSettings: Record<string, unknown>) => void
}>(function JSONEditor({isDisabled, profileRequest, replaceSettings}) {
  const [stringified, setStringified] = useState(
    JSON.stringify(profileRequest, null, '  ')
  )
  const [currentValue, setCurrentValue] = useState(stringified)
  const [height, setHeight] = useState('650px')
  const ref = useRef<HTMLTextAreaElement>()
  const onBlur = useCallback(() => {
    if (isJSONValid(currentValue)) {
      replaceSettings(JSON.parse(currentValue))
    }
  }, [currentValue, replaceSettings])

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setStringified(JSON.stringify(profileRequest, null, '  '))
    }
  }, [profileRequest, ref, setStringified])

  // Set the initial height to the scroll height (full contents of the text)
  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight + 5 + 'px')
    }
  }, [ref, setHeight])

  // Show a green border when there are unsaved changes
  const focusBorderColor =
    isJSONValid(currentValue) &&
    dequal(JSON.parse(currentValue), profileRequest)
      ? 'blue.500'
      : 'green.500'

  return (
    <FormControl isDisabled={isDisabled} isInvalid={!isJSONValid(currentValue)}>
      <FormLabel htmlFor='customProfileRequest'>
        Customize analysis request
      </FormLabel>
      <Textarea
        defaultValue={stringified}
        focusBorderColor={focusBorderColor}
        fontFamily='monospace'
        height={`${height}`}
        id='customProfileRequest'
        key={stringified}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={onBlur}
        ref={ref}
        spellCheck={false}
      />
      <FormHelperText>
        {message('analysis.customizeRequest.description')}
      </FormHelperText>
    </FormControl>
  )
})
