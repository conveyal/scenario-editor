import {
  Box,
  Select,
  Stack,
  Flex,
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react'
import find from 'lodash/find'
import get from 'lodash/get'
import omit from 'lodash/omit'
import dynamic from 'next/dynamic'
import React, {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {
  deleteRegionalAnalysis,
  updateRegionalAnalysis
} from 'lib/actions/analysis/regional'
import fetchAction from 'lib/actions/fetch'
import {ChevronLeft, DeleteIcon, DownloadIcon} from 'lib/components/icons'
import {API} from 'lib/constants'
import useControlledInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'
import selectActiveAnalysis from 'lib/selectors/active-regional-analysis'
import selectCutoff from 'lib/selectors/regional-display-cutoff'
import selectPercentile from 'lib/selectors/regional-display-percentile'
import selectPointset from 'lib/selectors/regional-display-destination-pointset'
import downloadObjectAsJson from 'lib/utils/download-json'

import {ConfirmDialog} from '../confirm-button'
import Editable from '../editable'
import IconButton from '../icon-button'
import RunningAnalysis from '../running-analysis'

import ProfileRequestDisplay from './profile-request-display'

const AggregationArea = dynamic(() => import('../map/aggregation-area'), {
  ssr: false
})
const AnalysisBounds = dynamic(() => import('../map/analysis-bounds'), {
  ssr: false
})
const DotMap = dynamic(
  () => import('lib/modules/opportunity-datasets/components/dotmap'),
  {ssr: false}
)
const RegionalLayer = dynamic(() => import('../map/regional'), {
  ssr: false
})
const RegionalResults = dynamic(() => import('./regional-results'), {
  ssr: false
})

// Ensure valid analysis name
const nameIsValid = (s) => s && s.length > 0

// Get full qualifier for opportunity datasets
const getFullODName = (od) => `${od?.sourceName}: ${od?.name}`

// Type to title
const csvResultsTypeToTitle = {
  ACCESS: 'Access CSV',
  PATHS: 'Paths CSV',
  TIMES: 'Times CSV'
}

export default function Regional(p) {
  const isComplete = !p.job
  const analysis = useSelector(selectActiveAnalysis)
  const dispatch = useDispatch<any>()
  const cutoffsMinutes = analysis.cutoffsMinutes
  const percentiles = analysis.travelTimePercentiles

  const onChangeCutoff = useCallback(
    (v) => dispatch(setSearchParameter('cutoff', v)),
    [dispatch]
  )
  const cutoffInput = useControlledInput({
    onChange: onChangeCutoff,
    parse: parseInt,
    value: useSelector(selectCutoff)
  })

  const onChangePercentile = useCallback(
    (v) => dispatch(setSearchParameter('percentile', v)),
    [dispatch]
  )
  const percentileInput = useControlledInput({
    onChange: onChangePercentile,
    parse: parseInt,
    value: useSelector(selectPercentile)
  })

  const activePointSet = useSelector(selectPointset)
  const activePointSetId = get(activePointSet, '_id')
  const onChangeDestinationPointSet = useCallback(
    (v) => dispatch(setSearchParameter('destinationPointSetId', v)),
    [dispatch]
  )
  const destinationPointSetInput = useControlledInput({
    onChange: onChangeDestinationPointSet,
    value: activePointSetId
  })

  async function _remove() {
    await dispatch(deleteRegionalAnalysis(analysis._id))
    return dispatch(setSearchParameter('analysisId'))
  }

  async function _downloadCSVResults(type) {
    const url = await dispatch(
      fetchAction({url: `${API.Regional}/${analysis._id}/csv/${type}`})
    )
    window.open(url)
  }

  async function _downloadRequestJSON() {
    const data = await dispatch(
      fetchAction({url: `${API.Regional}/${analysis._id}`})
    )
    downloadObjectAsJson({data, filename: analysis.name + '.json'})
  }

  /**
   * Perform an authenticated fetch to get a presigned URL to download a grid
   * from S3, then download it. Pass in the path to fetch.
   */
  async function _downloadProjectGIS(e) {
    e.preventDefault()
    const value = await dispatch(
      fetchAction({
        url: `${API.Regional}/${analysis._id}/grid/tiff?cutoff=${cutoffInput.value}&percentile=${percentileInput.value}&destinationPointSetId=${activePointSetId}`
      })
    )
    window.open(get(value, 'url'))
  }

  return (
    <>
      {!isComplete ? (
        <AnalysisBounds analysis={analysis} />
      ) : (
        <>
          <DotMap />
          <RegionalLayer />
          <AggregationArea />
        </>
      )}

      <Flex
        align='center'
        borderBottom='1px solid #E2E8F0'
        className={p.saveInProgress ? 'disableAndDim' : ''}
        p={2}
        width='320px'
      >
        <IconButton
          label='All regional analyses'
          onClick={() => dispatch(setSearchParameter('analysisId'))}
        >
          <ChevronLeft />
        </IconButton>

        <Box flex='1' fontSize='xl' fontWeight='bold' ml={2} overflow='hidden'>
          <Editable
            isValid={nameIsValid}
            onChange={(name) =>
              dispatch(updateRegionalAnalysis({...analysis, name}))
            }
            value={analysis.name}
          />
        </Box>

        <Flex>
          <ConfirmDialog
            description='Are you sure you would like to delete this analysis?'
            onConfirm={_remove}
          >
            <IconButton
              label={message('analysis.deleteRegionalAnalysis')}
              colorScheme='red'
            >
              <DeleteIcon />
            </IconButton>
          </ConfirmDialog>
        </Flex>
      </Flex>

      {p.job && <RunningAnalysis job={p.job} />}

      <Stack spacing={4} px={4} py={4}>
        {analysis?.request?.originPointSetKey != null ? (
          <Alert status='info'>
            <AlertIcon />
            <AlertDescription>
              Results for this analysis cannot be displayed on this map.
            </AlertDescription>
          </Alert>
        ) : (
          <Stack spacing={4}>
            {Array.isArray(analysis.destinationPointSetIds) && (
              <Select {...destinationPointSetInput}>
                {analysis.destinationPointSetIds.map((id) => (
                  <option key={id} value={id}>
                    {getFullODName(find(p.opportunityDatasets, ['_id', id]))}
                  </option>
                ))}
              </Select>
            )}

            <Stack isInline>
              {Array.isArray(cutoffsMinutes) && (
                <Select {...cutoffInput}>
                  {cutoffsMinutes.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </Select>
              )}

              {Array.isArray(percentiles) && (
                <Select {...percentileInput}>
                  {percentiles.map((p) => (
                    <option key={p} value={p}>
                      {p}th percentile
                    </option>
                  ))}
                </Select>
              )}
            </Stack>
          </Stack>
        )}

        {isComplete && (
          <Menu>
            <MenuButton
              as={Button}
              colorScheme='blue'
              leftIco={<DownloadIcon />}
            >
              Download results
            </MenuButton>
            <MenuList>
              <MenuItem
                isDisabled={analysis.request.originPointSetKey != null}
                onClick={_downloadProjectGIS}
              >
                GeoTIFF
              </MenuItem>
              <MenuItem onClick={_downloadRequestJSON}>
                Scenario and modification JSON
              </MenuItem>
              {Object.keys(analysis.resultStorage || {}).map((type) => (
                <MenuItem key={type} onClick={() => _downloadCSVResults(type)}>
                  {csvResultsTypeToTitle[type]}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
      </Stack>

      <ProfileRequestDisplay
        bundleId={analysis.bundleId}
        profileRequest={{
          ...omit(analysis, 'request'),
          ...analysis.request
        }}
        projectId={analysis.projectId}
      />

      {isComplete && analysis?.request?.originPointSetKey == null && (
        <RegionalResults
          analysis={analysis}
          analysisId={analysis._id}
          regionId={analysis.regionId}
          {...p}
        />
      )}
    </>
  )
}
