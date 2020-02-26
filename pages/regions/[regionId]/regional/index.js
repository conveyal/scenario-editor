import {Alert, AlertIcon, Box, Heading, Stack} from '@chakra-ui/core'
import {faServer} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import ms from 'ms'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  load as loadAllAnalyses,
  loadActiveRegionalJobs
} from 'lib/actions/analysis/regional'
import {loadRegion} from 'lib/actions/region'
import Icon from 'lib/components/icon'
import InnerDock from 'lib/components/inner-dock'
import Regional from 'lib/components/analysis/regional'
import Selector from 'lib/components/analysis/regional-analysis-selector'
import RunningJob from 'lib/components/running-analysis'
import useInterval from 'lib/hooks/use-interval'
import {loadOpportunityDatasets} from 'lib/modules/opportunity-datasets/actions'
import selectActiveAnalysis from 'lib/selectors/active-regional-analysis'
import selectRegionalAnalyses from 'lib/selectors/regional-analyses'
import withInitialFetch from 'lib/with-initial-fetch'

const REFETCH_INTERVAL = ms('15s')

const selectJobs = state => state.regionalAnalyses.activeJobs

function RegionalPage(p) {
  const dispatch = useDispatch()
  const allAnalyses = useSelector(selectRegionalAnalyses)
  const activeAnalysis = useSelector(selectActiveAnalysis)
  const jobs = useSelector(selectJobs)

  useInterval(
    () => dispatch(loadActiveRegionalJobs(p.query.regionId)),
    REFETCH_INTERVAL
  )

  // Look for an active job for the analysis
  const activeJob = jobs.find(j => j.jobId === get(activeAnalysis, '_id'))

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
          <Selector
            activeAnalysis={activeAnalysis}
            allAnalyses={allAnalyses}
            key={activeAnalysis}
          />
        </Box>

        {activeAnalysis ? (
          <Box>
            <Regional
              analysis={activeAnalysis}
              isComplete={!activeJob}
              key={activeAnalysis._id}
              opportunityDatasets={p.opportunityDatasets}
              regionalAnalyses={allAnalyses}
              setMapChildren={p.setMapChildren}
            />
            {activeJob && <RunningJob job={activeJob} mt={2} />}
          </Box>
        ) : (
          jobs.map(job => <RunningJob job={job} key={job.jobId} />)
        )}
      </Stack>
    </InnerDock>
  )
}

async function initialFetch(store, query) {
  const [regionalAnalyses, opportunityDatasets, region] = await Promise.all([
    store.dispatch(loadAllAnalyses(query.regionId)),
    store.dispatch(loadOpportunityDatasets(query.regionId)),
    store.dispatch(loadRegion(query.regionId)),
    store.dispatch(loadActiveRegionalJobs(query.regionId))
  ])

  return {
    analysis: regionalAnalyses.find(a => a._id === query.analysisId),
    opportunityDatasets,
    region,
    regionalAnalyses
  }
}

export default withInitialFetch(RegionalPage, initialFetch)
