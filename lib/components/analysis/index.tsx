import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  Stack
} from '@chakra-ui/react'
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

import selectAnalysisBounds from 'lib/selectors/analysis-bounds'
import selectCurrentProject from 'lib/selectors/current-project'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import selectProfileRequestHasChanged from 'lib/selectors/profile-request-has-changed'
import selectProfileRequestLonLat from 'lib/selectors/profile-request-lonlat'

import InnerDock from '../inner-dock'

import AnalysisTitle from './title'
import ResultsSliders from './results-sliders'
import SinglePointSettings from './single-point-settings'
import StackedPercentileSelector from './stacked-percentile-selector'

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

      <InnerDock width={640}>
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

            <ScenarioApplicationErrors errors={scenarioWarnings} />
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
            <ScenarioApplicationErrors errors={scenarioErrors} />
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

function Results({
  isDisabled,
  isStale, // are the results out of sync with the form?
  region
}) {
  const defaultCutoff = useSelector(selectMaxTripDurationMinutes)
  return (
    <Stack p={P.md}>
      <StackedPercentileSelector
        disabled={isDisabled}
        stale={isStale}
        regionId={region._id}
      />
      <ResultsSliders
        defaultCutoff={defaultCutoff}
        isDisabled={isDisabled}
        isStale={isStale}
      />
    </Stack>
  )
}

function ScenarioApplicationErrors({errors, ...p}) {
  /** Render any errors that may have occurred applying the project */
  return (
    <Stack spacing={P.md} {...p} width='100%'>
      {errors.map((err, idx) => (
        <Stack key={idx}>
          <Heading size='sm'>
            {typeof err.modificationId === 'string'
              ? message('analysis.errorsInModification', {
                  id: err.modificationId
                })
              : err.title ?? 'Request Error'}
          </Heading>
          <Box as='ul' pl={6}>
            {err.messages.map((msg: string, idx: number) => (
              <li key={`message-${idx}`}>
                <Box as='pre' overflow='auto' maxHeight='200px'>
                  {msg}
                </Box>
              </li>
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  )
}
