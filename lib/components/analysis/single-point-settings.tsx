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
  Textarea
} from '@chakra-ui/react'
import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import isEqual from 'lodash/isEqual'
import {memo, useCallback, useEffect, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {getForProject as loadModifications} from 'lib/actions/modifications'
import {loadProject} from 'lib/actions/project'
import {
  setCopyRequestSettings,
  setRequestsSettings,
  updateRequestsSettings
} from 'lib/actions/analysis/profile-request'
import {LS_MOM} from 'lib/constants'
import useOnMount from 'lib/hooks/use-on-mount'
import message from 'lib/message'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import selectCurrentBundle from 'lib/selectors/current-bundle'
import selectCurrentProject from 'lib/selectors/current-project'
import selectProfileRequest from 'lib/selectors/profile-request'
import selectProfileRequestLonLat from 'lib/selectors/profile-request-lonlat'
import selectProfileRequestHasChanged from 'lib/selectors/profile-request-has-changed'
import selectRegionBounds from 'lib/selectors/region-bounds'
import {fromLatLngBounds} from 'lib/utils/bounds'
import cleanProjectScenarioName from 'lib/utils/clean-project-scenario-name'
import {getParsedItem} from 'lib/utils/local-storage'
import {secondsToHhMmString} from 'lib/utils/time'

import ControlledSelect from '../controlled-select'
import {ChevronDown, ChevronUp, CodeIcon, MouseIcon} from '../icons'
import Presets from '../presets'

import DownloadMenu from './download-menu'
import ProfileRequestEditor from './profile-request-editor'
import AdvancedSettings from './advanced-settings'
import ModeSelector from './mode-selector'
import CreateRegional from './create-regional'
import getFeedsRoutesAndStops from 'lib/actions/get-feeds-routes-and-stops'
import ModeSummary from './mode-summary'

const SPACING_XS = 2
const SPACING = 5
const SPACING_LG = 8

const getName = fpGet('name')
const getId = fpGet('_id')

async function loadAllProjectData(
  dispatch: (v: unknown) => Promise<any>,
  projectId: string
) {
  const results = await Promise.all([
    dispatch(loadProject(projectId)),
    dispatch(loadModifications(projectId))
  ])
  const [project, modifications] = results
  const _idsOnMap: string[] = get(
    getParsedItem(LS_MOM),
    projectId,
    []
  ) as string[]
  await dispatch(
    getFeedsRoutesAndStops({
      bundleId: project.bundleId,
      forceCompleteUpdate: true,
      modifications: modifications.filter((m) => _idsOnMap.includes(m._id))
    })
  )
}

export default function Settings({
  bundles,
  projects,
  region,
  regionalAnalyses
}) {
  const dispatch = useDispatch<any>()
  const opportunityDataset = useSelector(activeOpportunityDataset)
  const profileRequest = useSelector(selectProfileRequest)
  const currentBundle = useSelector(selectCurrentBundle)
  const currentProject = useSelector(selectCurrentProject)
  const profileRequestLonLat = useSelector(selectProfileRequestLonLat)
  const variantIndex = useSelector((s) =>
    parseInt(get(s, 'analysis.requestsSettings[0].variantIndex', -1))
  )
  const resultsSettings = useSelector((s) =>
    get(s, 'analysis.resultsSettings', [])
  )

  const isochroneFetchStatus = useSelector((s) =>
    get(s, 'analysis.isochroneFetchStatus')
  )

  const regionBounds = useSelector(selectRegionBounds)
  const requestsSettings = useSelector((s) =>
    get(s, 'analysis.requestsSettings')
  )
  const copyRequestSettings = useSelector((s) =>
    get(s, 'analysis.copyRequestSettings')
  )

  const comparisonProjectId = useSelector((s) =>
    get(s, 'analysis.requestsSettings[1].projectId')
  )
  const comparisonVariant = useSelector((s) =>
    parseInt(get(s, 'analysis.requestsSettings[1].variantIndex', -1))
  )
  const comparisonProject = projects.find((p) => p._id === comparisonProjectId)
  const comparisonBundle = bundles.find(
    (b) => b._id === get(comparisonProject, 'bundleId')
  )

  const isFetchingIsochrone = !!isochroneFetchStatus
  const disableInputs = isFetchingIsochrone || !currentProject
  const scenarioOptions = [
    {label: message('analysis.baseline'), value: -1},
    ...get(currentProject, 'variants', []).map((v, index) => ({
      label: v,
      value: index
    }))
  ]
  const comparisonScenarioOptions = [
    // special value -1 indicates no modifications
    {label: message('analysis.baseline'), value: -1},
    ...get(comparisonProject, 'variants', []).map((label, value) => ({
      label,
      value
    }))
  ]

  // Simplify commonly used set function
  const updatePrimaryPR = useCallback(
    (params) => {
      dispatch(updateRequestsSettings({index: 0, params}))
    },
    [dispatch]
  )
  const updateComparisonPR = useCallback(
    (params) => {
      dispatch(updateRequestsSettings({index: 1, params}))
    },
    [dispatch]
  )
  const replaceSettings = useCallback(
    (index, newSettings) => {
      dispatch(
        setRequestsSettings(
          requestsSettings.map((s, i) => (i === index ? newSettings : s))
        )
      )
    },
    [dispatch, requestsSettings]
  )

  // On initial load, the query string may be out of sync with the requestsSettings.projectId
  useOnMount(() => {
    const projectId = currentProject?._id
    if (projectId != null && projectId !== 'undefined') {
      dispatch(setSearchParameter({projectId}))
      updatePrimaryPR({projectId})

      // Load project data for display
      loadAllProjectData(dispatch, projectId)
    }
  })

  // Set the analysis bounds to be the region bounds if bounds do not exist
  useEffect(() => {
    if (!profileRequest.bounds) {
      updatePrimaryPR({bounds: fromLatLngBounds(regionBounds)})
    }
  }, [profileRequest, regionBounds, updatePrimaryPR])

  // Current project is stored in the query string
  const _setCurrentProject = useCallback(
    (option) => {
      const projectId = get(option, '_id')
      dispatch(setSearchParameter({projectId}))
      updatePrimaryPR({projectId, variantIndex: -1})

      // Load project data for display
      loadAllProjectData(dispatch, projectId)
    },
    [dispatch, updatePrimaryPR]
  )
  const _setCurrentVariant = useCallback(
    (option) => updatePrimaryPR({variantIndex: parseInt(option.value)}),
    [updatePrimaryPR]
  )

  const _setComparisonProject = useCallback(
    (project) => {
      if (project) {
        if (!comparisonProject) {
          updateComparisonPR({
            ...profileRequest,
            projectId: project._id,
            variantIndex: -1
          })
        } else {
          updateComparisonPR({
            projectId: project._id,
            variantIndex: -1
          })
        }
      } else {
        updateComparisonPR({
          projectId: null,
          variantIndex: null
        })
      }
    },
    [comparisonProject, profileRequest, updateComparisonPR]
  )

  const _setComparisonVariant = useCallback(
    (e) => updateComparisonPR({variantIndex: parseInt(e.value)}),
    [updateComparisonPR]
  )

  return (
    <>
      <Box
        borderBottom='1px solid'
        borderBottomColor='blue.50'
        borderTop='1px solid #E2E8F0'
        id='PrimaryAnalysisSettings'
      >
        <RequestHeading
          colorScheme='blue'
          hasResults={resultsSettings.length > 0}
          opportunityDataset={opportunityDataset}
          profileRequest={requestsSettings[0]}
          project={currentProject}
          regionalAnalyses={regionalAnalyses}
          scenario={variantIndex}
        />
        <RequestSettings
          colorScheme='blue'
          bundle={currentBundle}
          isDisabled={disableInputs}
          isFetchingIsochrone={isFetchingIsochrone}
          profileRequest={requestsSettings[0]}
          profileRequestLonLat={profileRequestLonLat}
          project={currentProject}
          projects={projects}
          regionId={region._id}
          regionBounds={region.bounds}
          regionalAnalyses={regionalAnalyses}
          replaceSettings={(s) => replaceSettings(0, s)}
          scenario={variantIndex}
          scenarioOptions={scenarioOptions}
          setProject={_setCurrentProject}
          setScenario={_setCurrentVariant}
          updateProfileRequest={updatePrimaryPR}
        />
      </Box>

      <Box
        borderBottom='1px solid'
        borderBottomColor='red.100'
        id='ComparisonAnalysisSettings'
      >
        <RequestHeading
          colorScheme='red'
          isComparison
          hasResults={resultsSettings.length > 1}
          opportunityDataset={opportunityDataset}
          profileRequest={requestsSettings[1]}
          project={comparisonProject}
          regionalAnalyses={regionalAnalyses}
          scenario={comparisonVariant}
        />
        <RequestSettings
          bundle={comparisonBundle}
          colorScheme='red'
          copyRequestSettings={copyRequestSettings}
          isComparison
          isDisabled={disableInputs}
          isFetchingIsochrone={isFetchingIsochrone}
          profileRequest={requestsSettings[1]}
          profileRequestLonLat={profileRequestLonLat}
          project={comparisonProject}
          projects={projects}
          regionId={region._id}
          regionBounds={region.bounds}
          regionalAnalyses={regionalAnalyses}
          replaceSettings={(s) => replaceSettings(1, s)}
          scenario={comparisonVariant}
          scenarioOptions={comparisonScenarioOptions}
          setProfileRequest
          setProject={_setComparisonProject}
          setScenario={_setComparisonVariant}
          updateProfileRequest={updateComparisonPR}
        />
      </Box>
    </>
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
  hasResults,
  isComparison = false,
  opportunityDataset,
  profileRequest,
  project,
  scenario,
  ...p
}) {
  const settingsHaveChanged = useSelector(selectProfileRequestHasChanged)
  const scenarioName =
    get(project, 'variants', [])[scenario] || message('variant.baseline')

  const projectDownloadName = cleanProjectScenarioName(project, scenario)

  return (
    <Flex
      align='center'
      px={SPACING}
      pt={SPACING_LG}
      pb={SPACING_XS}
      justify='space-between'
      textAlign='left'
      {...p}
    >
      {project ? (
        <>
          <Stack flex='1' overflow='hidden'>
            <Heading size='md' color={`${colorScheme}.500`} overflow='hidden'>
              {project.name}
            </Heading>
            <Heading size='sm' color='gray.500' overflow='hidden'>
              {scenarioName}
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

      <Stack spacing={SPACING_XS} isInline>
        <DownloadMenu
          isComparison={isComparison}
          isDisabled={!hasResults || settingsHaveChanged}
          key={colorScheme}
          opportunityDataset={opportunityDataset}
          projectId={get(project, '_id')}
          projectName={projectDownloadName}
          requestsSettings={profileRequest}
          variantIndex={scenario}
        />
        <Box>
          <CreateRegional
            isDisabled={!hasResults || settingsHaveChanged}
            profileRequest={profileRequest}
            projectId={get(project, '_id')}
            variantIndex={scenario}
          />
        </Box>
      </Stack>
    </Flex>
  )
}

function RequestSettings({
  bundle,
  colorScheme,
  copyRequestSettings = false,
  isComparison = false,
  isDisabled,
  isFetchingIsochrone,
  profileRequest,
  profileRequestLonLat,
  project,
  projects,
  regionId,
  regionalAnalyses,
  regionBounds,
  replaceSettings,
  scenario,
  scenarioOptions,
  setProject,
  setScenario,
  updateProfileRequest,
  ...p
}) {
  // Manually control tabs in order to control when tab contents is rendered.
  const [tabIndex, setTabIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(!project)
  const dispatch = useDispatch()

  return (
    <Stack spacing={0} {...p}>
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
              isDisabled={!project || isDisabled}
              key={get(project, '_id')}
              label={message('common.scenario')}
              onChange={setScenario}
              options={scenarioOptions}
              value={scenarioOptions.find((v) => v.value === scenario)}
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
                regionId={regionId}
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
              index={tabIndex}
              onChange={setTabIndex}
              variant='soft-rounded'
              colorScheme={colorScheme}
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
                        bundle={bundle}
                        disabled={isDisabled}
                        profileRequest={profileRequest}
                        project={project}
                        updateProfileRequest={updateProfileRequest}
                      />

                      <AdvancedSettings
                        disabled={isDisabled}
                        profileRequest={profileRequest}
                        regionalAnalyses={regionalAnalyses}
                        regionBounds={regionBounds}
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

const isJSONValid = (jsonString) => {
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
    isEqual(JSON.parse(currentValue), profileRequest)
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
        {message('analysis.customizeProfileRequest.description')}
      </FormHelperText>
    </FormControl>
  )
})
