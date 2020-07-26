import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
  Text,
  Tooltip
} from '@chakra-ui/core'
import {
  faChevronDown,
  faChevronRight,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {
  setCopyRequestSettings,
  updateRequestsSettings
} from 'lib/actions/analysis/profile-request'
import {createRegionalAnalysis} from 'lib/actions/analysis/regional'
import message from 'lib/message'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import selectCurrentBundle from 'lib/selectors/current-bundle'
import selectCurrentProject from 'lib/selectors/current-project'
import selectProfileRequest from 'lib/selectors/profile-request'
import selectProfileRequestHasChanged from 'lib/selectors/profile-request-has-changed'
import selectRegionBounds from 'lib/selectors/region-bounds'
import {fromLatLngBounds} from 'lib/utils/bounds'
import cleanProjectScenarioName from 'lib/utils/clean-project-scenario-name'
import {secondsToHhMmString} from 'lib/utils/time'

import ControlledSelect from '../controlled-select'
import Icon from '../icon'
import ModeIcon from '../mode-icon'

import BookmarkChooser from './bookmark-chooser'
import DownloadMenu from './download-menu'
import ProfileRequestEditor from './profile-request-editor'
import AdvancedSettings from './advanced-settings'
import ModeSelector from './mode-selector'

const SPACING_XS = 2
const SPACING = 5
const SPACING_LG = 8

export default function Settings({
  bundles,
  projects,
  region,
  regionalAnalyses
}) {
  const dispatch = useDispatch()
  const opportunityDataset = useSelector(activeOpportunityDataset)
  const profileRequest = useSelector(selectProfileRequest)
  const currentBundle = useSelector(selectCurrentBundle)
  const currentProject = useSelector(selectCurrentProject)
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
  const setPrimaryPR = useCallback(
    (params) => {
      dispatch(updateRequestsSettings({index: 0, params}))
    },
    [dispatch]
  )
  const setComparisonPR = useCallback(
    (params) => {
      dispatch(updateRequestsSettings({index: 1, params}))
    },
    [dispatch]
  )

  // On initial load, the query string may be out of sync with the requestsSettings.projectId
  useEffect(() => {
    const projectId = get(currentProject, '_id')
    const settingsId = get(requestsSettings, '[0].projectId')
    if (
      projectId !== settingsId &&
      projectId != null &&
      projectId !== 'undefined'
    ) {
      setPrimaryPR({projectId})
    }
  }, []) // eslint-disable-line

  // Set the analysis bounds to be the region bounds if bounds do not exist
  useEffect(() => {
    if (!profileRequest.bounds) {
      setPrimaryPR({bounds: fromLatLngBounds(regionBounds)})
    }
  }, [profileRequest, regionBounds, setPrimaryPR])

  // Current project is stored in the query string
  const _setCurrentProject = useCallback(
    (option) => {
      const projectId = get(option, '_id')
      dispatch(setSearchParameter({projectId}))
      setPrimaryPR({projectId, variantIndex: -1})
    },
    [dispatch, setPrimaryPR]
  )
  const _setCurrentVariant = useCallback(
    (option) => setPrimaryPR({variantIndex: parseInt(option.value)}),
    [setPrimaryPR]
  )

  const _setComparisonProject = useCallback(
    (project) => {
      if (project) {
        if (!comparisonProject) {
          setComparisonPR({
            ...profileRequest,
            projectId: project._id,
            variantIndex: -1
          })
        } else {
          setComparisonPR({
            projectId: project._id,
            variantIndex: -1
          })
        }
      } else {
        setComparisonPR({
          projectId: null,
          variantIndex: null
        })
      }
    },
    [comparisonProject, dispatch, profileRequest, setComparisonPR]
  )

  const _setComparisonVariant = useCallback(
    (e) => setComparisonPR({variantIndex: parseInt(e.value)}),
    [dispatch]
  )

  return (
    <>
      <Box
        borderBottom='1px solid'
        borderBottomColor='blue.100'
        borderTop='1px solid #E2E8F0'
        id='PrimaryAnalysisSettings'
      >
        <RequestHeading
          hasResults={resultsSettings.length > 0}
          opportunityDataset={opportunityDataset}
          profileRequest={requestsSettings[0]}
          project={currentProject}
          regionalAnalyses={regionalAnalyses}
          scenario={variantIndex}
        />
        <RequestSettings
          bundle={currentBundle}
          isDisabled={disableInputs}
          isFetchingIsochrone={isFetchingIsochrone}
          profileRequest={requestsSettings[0]}
          project={currentProject}
          projects={projects}
          regionBounds={region.bounds}
          regionalAnalyses={regionalAnalyses}
          scenario={variantIndex}
          scenarioOptions={scenarioOptions}
          setProfileRequest={setPrimaryPR}
          setProject={_setCurrentProject}
          setScenario={_setCurrentVariant}
        />
      </Box>

      <Box
        borderBottom='1px solid'
        borderBottomColor='red.100'
        id='ComparisonAnalysisSettings'
      >
        <RequestHeading
          color='red'
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
          color='red'
          copyRequestSettings={copyRequestSettings}
          isComparison
          isDisabled={disableInputs}
          isFetchingIsochrone={isFetchingIsochrone}
          profileRequest={requestsSettings[1]}
          project={comparisonProject}
          projects={projects}
          regionBounds={region.bounds}
          regionalAnalyses={regionalAnalyses}
          scenario={comparisonVariant}
          scenarioOptions={comparisonScenarioOptions}
          setProfileRequest={setComparisonPR}
          setProject={_setComparisonProject}
          setScenario={_setComparisonVariant}
        />
      </Box>
    </>
  )
}

function RequestSummary({color, profileRequest, ...p}) {
  // Transit modes is stored as a string
  const transitModesStr = get(profileRequest, 'transitModes', '')
  const transitModes = transitModesStr.split(',')

  return (
    <Flex flex='2' justify='space-evenly' {...p}>
      <Stack align='center' isInline spacing={1}>
        <ModeIcon mode={profileRequest.accessModes} />
        {transitModesStr.length > 0 && (
          <Tooltip
            hasArrow
            aria-label={transitModes.join(', ')}
            label={transitModes.join(', ')}
          >
            <Stack align='center' isInline spacing={1}>
              <Box color={`${color}.500`} fontSize='xs'>
                <Icon icon={faChevronRight} />
              </Box>
              {transitModes.slice(0, 2).map((m) => (
                <ModeIcon mode={m} key={m} />
              ))}
              {transitModes.length > 2 && <Box>...</Box>}
              {profileRequest.egressModes !== 'WALK' && (
                <Stack align='center' isInline spacing={1}>
                  <Box color={`${color}.500`} fontSize='xs'>
                    <Icon icon={faChevronRight} />
                  </Box>
                  <ModeIcon mode={profileRequest.egressModes} />
                </Stack>
              )}
            </Stack>
          </Tooltip>
        )}
      </Stack>

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
  color = 'blue',
  hasResults,
  isComparison = false,
  opportunityDataset,
  profileRequest,
  project,
  regionalAnalyses,
  scenario,
  ...p
}) {
  const dispatch = useDispatch()
  const settingsHaveChanged = useSelector(selectProfileRequestHasChanged)
  const scenarioName =
    get(project, 'variants', [])[scenario] || message('variant.baseline')

  function onCreateRegionalAnalysis(e) {
    e.stopPropagation()

    if (project) {
      const name = window.prompt(
        'Enter a name and click ok to begin a regional analysis job for this project and settings:',
        `Analysis ${regionalAnalyses.length + 1}: ${
          project.name
        } ${scenarioName}`
      )
      if (name && name.length > 0) {
        dispatch(
          createRegionalAnalysis({
            ...profileRequest,
            name,
            projectId: project._id,
            variantIndex: scenario
          })
        )
      }
    }
  }

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
            <Heading size='md' color={`${color}.500`} overflow='hidden'>
              {project.name}
            </Heading>
            <Heading size='sm' color='gray.500' overflow='hidden'>
              {scenarioName}
            </Heading>
          </Stack>

          {isComparison ? (
            profileRequest && (
              <RequestSummary
                color={color}
                profileRequest={profileRequest}
                flex='2'
              />
            )
          ) : (
            <RequestSummary
              color={color}
              profileRequest={profileRequest}
              flex='2'
            />
          )}
        </>
      ) : (
        <Heading size='md' color={`${color}.500`}>
          Select a {isComparison ? 'comparison ' : ''}project
        </Heading>
      )}

      <Stack spacing={SPACING_XS} isInline>
        <DownloadMenu
          isComparison={isComparison}
          isDisabled={!hasResults || settingsHaveChanged}
          key={color}
          opportunityDataset={opportunityDataset}
          projectId={get(project, '_id')}
          projectName={projectDownloadName}
          requestsSettings={profileRequest}
          variantIndex={scenario}
        />
        <Button
          isDisabled={!hasResults || settingsHaveChanged || !opportunityDataset}
          onClick={onCreateRegionalAnalysis}
          rightIcon='small-add'
          variantColor='green'
        >
          Multi-point
        </Button>
      </Stack>
    </Flex>
  )
}

function RequestSettings({
  bundle,
  color = 'blue',
  copyRequestSettings = false,
  isComparison = false,
  isDisabled,
  isFetchingIsochrone,
  profileRequest,
  project,
  projects,
  regionalAnalyses,
  regionBounds,
  scenario,
  scenarioOptions,
  setProfileRequest,
  setProject,
  setScenario,
  ...p
}) {
  const [isOpen, setIsOpen] = useState(!project)
  const dispatch = useDispatch()

  return (
    <Stack spacing={0} {...p}>
      {isOpen && (
        <Stack spacing={SPACING} p={SPACING}>
          <Stack isInline spacing={SPACING}>
            <ControlledSelect
              flex='1'
              getOptionLabel={(o) => o.name}
              getOptionValue={(o) => o._id}
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

            <BookmarkChooser
              disabled={isDisabled}
              flex='1'
              isComparison={isComparison}
              onChange={(bookmarkSettings) =>
                setProfileRequest({...bookmarkSettings})
              }
              requestSettings={profileRequest}
            />
          </Stack>

          {isComparison && (
            <FormControl isDisabled={!project} textAlign='center' width='100%'>
              <FormLabel htmlFor='copySettings'>
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
            <Stack spacing={SPACING}>
              <ModeSelector
                accessModes={profileRequest.accessModes}
                directModes={profileRequest.directModes}
                disabled={isDisabled}
                egressModes={profileRequest.egressModes}
                transitModes={profileRequest.transitModes}
                update={setProfileRequest}
              />

              <ProfileRequestEditor
                bundle={bundle}
                color={color}
                disabled={isDisabled}
                profileRequest={profileRequest}
                project={project}
                setProfileRequest={setProfileRequest}
              />

              <AdvancedSettings
                disabled={isDisabled}
                profileRequest={profileRequest}
                regionalAnalyses={regionalAnalyses}
                regionBounds={regionBounds}
                setProfileRequest={setProfileRequest}
              />
            </Stack>
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
        variantColor={color}
        width='100%'
      >
        <Icon icon={isOpen ? faChevronUp : faChevronDown} />
      </Button>
    </Stack>
  )
}
