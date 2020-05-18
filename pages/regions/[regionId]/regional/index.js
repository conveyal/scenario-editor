import {Alert, AlertIcon, Box, Heading, Stack} from '@chakra-ui/core'
import {faServer} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import ms from 'ms'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {loadAggregationAreas} from 'lib/actions/aggregation-areas'
import {
  load as loadAllAnalyses,
  loadActiveRegionalJobs
} from 'lib/actions/analysis/regional'
import {loadRegion} from 'lib/actions/region'
import Icon from 'lib/components/icon'
import InnerDock from 'lib/components/inner-dock'
import Regional from 'lib/components/analysis/regional'
import RunningJob from 'lib/components/running-analysis'
import Select from 'lib/components/select'
import useControlledInput from 'lib/hooks/use-controlled-input'
import useInterval from 'lib/hooks/use-interval'
import MapLayout from 'lib/layouts/map'
import {loadOpportunityDatasets} from 'lib/modules/opportunity-datasets/actions'
import selectActiveAnalysis from 'lib/selectors/active-regional-analysis'
import selectRegionalAnalyses from 'lib/selectors/regional-analyses'
import withInitialFetch from 'lib/with-initial-fetch'

const REFETCH_INTERVAL = ms('15s')

const selectJobs = (s) => get(s, 'regionalAnalyses.activeJobs', [])

const RegionalPage = withInitialFetch(
  (p) => {
    const dispatch = useDispatch()
    const allAnalyses = useSelector(selectRegionalAnalyses)
    const activeAnalysis = useSelector(selectActiveAnalysis)
    const jobs = useSelector(selectJobs)
    const [activeId, onChange] = useControlledInput(
      get(activeAnalysis, '_id'),
      (v) => dispatch(setSearchParameter('analysisId', v))
    )
    const activeJob = jobs.find((j) => j.jobId === activeId)

    // Analyses are deleted before the jobs get cleared
    const jobsWithAnalysis = jobs.filter(
      (j) => allAnalyses.findIndex((a) => j.jobId === a._id) !== -1
    )

    useInterval(
      () => dispatch(loadActiveRegionalJobs(p.query.regionId)),
      REFETCH_INTERVAL
    )

    return (
      <InnerDock>
        <Stack p={4} spacing={4}>
          <Heading size='md'>
            <Icon icon={faServer} /> Regional Analyses
          </Heading>

          {allAnalyses.length === 0 && (
            <Alert status='warning'>
              <AlertIcon /> You have no running or completed regional analysis
              jobs! To create one, go to the single point analysis page.
            </Alert>
          )}

          <Box>
            <Select
              isClearable
              key={`analysis-${activeId}`} // Dont show deleted analyses as selected
              onChange={(v) => onChange(get(v, '_id'))}
              getOptionLabel={(a) => a.name}
              getOptionValue={(a) => a._id}
              options={allAnalyses}
              placeholder='View a regional analysis...'
              value={allAnalyses.find((a) => a._id === activeId)}
            />
          </Box>

          {activeId && activeAnalysis ? (
            <Stack spacing={4}>
              {activeJob && <RunningJob job={activeJob} />}
              <Box>
                <Regional
                  analysis={activeAnalysis}
                  isComplete={!activeJob}
                  key={activeAnalysis._id}
                  opportunityDatasets={p.opportunityDatasets}
                  regionalAnalyses={allAnalyses}
                  setMapChildren={p.setMapChildren}
                />
              </Box>
            </Stack>
          ) : (
            jobsWithAnalysis.map((job) => (
              <RunningJob job={job} key={job.jobId} />
            ))
          )}
        </Stack>
      </InnerDock>
    )
  },
  async (dispatch, query) => {
    const [
      aggregationAreas,
      regionalAnalyses,
      opportunityDatasets,
      region
    ] = await Promise.all([
      dispatch(loadAggregationAreas(query.regionId)),
      dispatch(loadAllAnalyses(query.regionId)),
      dispatch(loadOpportunityDatasets(query.regionId)),
      dispatch(loadRegion(query.regionId)),
      dispatch(loadActiveRegionalJobs(query.regionId))
    ])

    return {
      aggregationAreas,
      analysis: regionalAnalyses.find((a) => a._id === query.analysisId),
      opportunityDatasets,
      region,
      regionalAnalyses
    }
  }
)

RegionalPage.Layout = MapLayout

export default RegionalPage
