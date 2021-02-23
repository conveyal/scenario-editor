import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  List,
  ListItem,
  Stack,
  Skeleton
} from '@chakra-ui/core'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import {useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {updateRequestsSettings} from 'lib/actions/analysis/profile-request'
import {
  cancelFetch,
  clearResults,
  fetchTravelTimeSurface
} from 'lib/actions/analysis'
import message from 'lib/message'
import OpportunityDatasetSelector from 'lib/modules/opportunity-datasets/components/selector'
import selectAnalysisBounds from 'lib/selectors/analysis-bounds'
import selectCurrentProject from 'lib/selectors/current-project'
import selectProfileRequestHasChanged from 'lib/selectors/profile-request-has-changed'
import selectProfileRequestLonLat from 'lib/selectors/profile-request-lonlat'

import InnerDock from '../inner-dock'

import AnalysisTitle from './title'
import {CutoffSlider, PercentileSlider} from './results-sliders'
import SinglePointSettings from './single-point-settings'
import StackedPercentileSelector from './stacked-percentile-selector'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'

/**
 * Hide the loading text from map components because it is awkward.
 */
const noSSR = {
  loading: () => null,
  ssr: false
}

const DotMap = dynamic(
  () => import('lib/modules/opportunity-datasets/components/dotmap'),
  noSSR
)
const DTTD = dynamic(
  () => import('../map/destination-travel-time-distribution'),
  noSSR
)
const Isochrones = dynamic(() => import('../map/isochrones'), noSSR)
const Rectangle = dynamic(() => import('../map/rectangle'), noSSR)
const ModificationsMap = dynamic(
  () => import('../modifications-map/display-all'),
  noSSR
)
const AnalysisMap = dynamic(() => import('./map'), noSSR)

// Standard Spacing (relates to Chakra values)
const P = {
  md: 5,
  lg: 6
}

export default function SinglePointAnalysis({
  bundles,
  projects,
  region,
  regionalAnalyses
}) {
  const dispatch = useDispatch()
  const currentProject = useSelector(selectCurrentProject)
  const isochroneFetchStatus = useSelector((s) =>
    get(s, 'analysis.isochroneFetchStatus')
  )

  const profileRequestHasChanged = useSelector(selectProfileRequestHasChanged)
  const profileRequestLonLat = useSelector(selectProfileRequestLonLat)
  const scenarioErrors = useSelector((s) =>
    get(s, 'analysis.scenarioApplicationErrors')
  )
  const scenarioWarnings = useSelector((s) =>
    get(s, 'analysis.scenarioApplicationWarnings')
  )
  const analysisBounds = useSelector(selectAnalysisBounds)
  const readyToFetch = !!currentProject
  const isFetchingIsochrone = !!isochroneFetchStatus
  const disableInputs = isFetchingIsochrone || !currentProject

  const displayedDataIsCurrent =
    !profileRequestHasChanged && !isFetchingIsochrone

  /**
   * Set the origin and fetch if ready.
   */
  const _setOrigin = useCallback(
    (ll) => {
      dispatch(
        updateRequestsSettings({
          index: 0,
          params: {
            fromLat: ll.lat,
            fromLon: ll.lon
          }
        })
      )
      if (readyToFetch) dispatch(fetchTravelTimeSurface())
    },
    [dispatch, readyToFetch]
  )

  // On mount / unmount
  useEffect(() => {
    dispatch(clearResults())
    return () => {
      dispatch(cancelFetch())
      dispatch(clearResults())
    }
  }, [dispatch])

  return (
    <>
      <DotMap />

      {analysisBounds && (
        <Rectangle
          bounds={analysisBounds}
          dashArray='3 8'
          fillOpacity={0}
          pointerEvents='none'
          weight={1}
        />
      )}

      <ModificationsMap isEditing />

      <Isochrones isCurrent={displayedDataIsCurrent} />

      <AnalysisMap
        isDisabled={disableInputs}
        markerPosition={profileRequestLonLat}
        markerTooltip={
          !currentProject ? message('analysis.disableFetch') : undefined
        }
        setOrigin={_setOrigin}
      />

      <DTTD />

      <AnalysisTitle />

      <InnerDock style={{width: '640px'}}>
        {scenarioWarnings != null && scenarioWarnings.length > 0 && (
          <Alert
            alignItems='flex-start'
            flexDirection='column'
            px={P.md}
            py={P.md}
            status='warning'
          >
            <Flex mb={P.md}>
              <AlertIcon />
              <AlertTitle>{message('analysis.warningsInProject')}</AlertTitle>
            </Flex>
            <AlertDescription pl={P.lg}>
              <ScenarioApplicationErrors errors={scenarioWarnings} />
            </AlertDescription>
          </Alert>
        )}

        {scenarioErrors != null && scenarioErrors.length > 0 && (
          <Alert
            alignItems='flex-start'
            flexDirection='column'
            px={P.md}
            py={P.md}
            status='error'
          >
            <Flex mb={P.md}>
              <AlertIcon />
              <AlertTitle>{message('analysis.errorsInProject')}</AlertTitle>
            </Flex>
            <AlertDescription pl={P.lg}>
              <ScenarioApplicationErrors errors={scenarioErrors} />
            </AlertDescription>
          </Alert>
        )}

        <Results
          isDisabled={disableInputs}
          isStale={profileRequestHasChanged}
          region={region}
        />

        <SinglePointSettings
          bundles={bundles}
          projects={projects}
          region={region}
          regionalAnalyses={regionalAnalyses}
        />
      </InnerDock>
    </>
  )
}

const filterFreeform = (dataset: CL.SpatialDataset) =>
  dataset.format !== 'FREEFORM'

function Results({
  isDisabled,
  isStale, // are the results out of sync with the form?
  region
}) {
  const resultsSettings = useSelector((s) =>
    get(s, 'analysis.resultsSettings', [])
  )
  const opportunityDataset = useSelector(activeOpportunityDataset)
  const isDisabledOrStale = isDisabled || isStale
  return (
    <Stack spacing={P.md} p={P.md}>
      <Skeleton
        minHeight='20px'
        isLoaded={resultsSettings.length > 0 && opportunityDataset}
        speed={1000}
      >
        <StackedPercentileSelector disabled={isDisabled} stale={isStale} />
      </Skeleton>

      <CutoffSlider isDisabled={isDisabledOrStale} />

      <Stack isInline spacing={P.md}>
        <FormControl flex='1' isDisabled={isDisabled}>
          <FormLabel htmlFor='select-opportunity-dataset'>
            {message('analysis.grid')}
          </FormLabel>
          <OpportunityDatasetSelector
            filter={filterFreeform}
            isDisabled={isDisabled}
            regionId={region._id}
          />
        </FormControl>

        <PercentileSlider flex='1' isDisabled={isDisabledOrStale} />
      </Stack>
    </Stack>
  )
}

function ScenarioApplicationErrors({errors, ...p}) {
  /** Render any errors that may have occurred applying the project */
  return (
    <Stack spacing={P.md} {...p} maxHeight='200px' overflowY='scroll'>
      {errors.map((err, idx) => (
        <Stack key={idx}>
          <Heading size='sm'>
            {message('analysis.errorsInModification', {id: err.modificationId})}
          </Heading>
          <List styleType='disc' spacing={2}>
            {err.messages.map((msg, idx) => (
              <ListItem key={`message-${idx}`}>{msg}</ListItem>
            ))}
          </List>
        </Stack>
      ))}
    </Stack>
  )
}
