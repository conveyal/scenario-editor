import {Button, Flex, Heading, Text} from '@chakra-ui/react'
import get from 'lodash/get'
import {useDispatch, useSelector} from 'react-redux'

import {
  fetchTravelTimeSurface,
  setIsochroneFetchStatus
} from 'lib/actions/analysis'
import {abortFetch} from 'lib/actions/fetch'
import {SyncIcon, XIcon} from 'lib/components/icons'
import {FETCH_TRAVEL_TIME_SURFACE} from 'lib/constants'
import message from 'lib/message'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import selectCurrentProject from 'lib/selectors/current-project'
import selectProfileRequestHasChanged from 'lib/selectors/profile-request-has-changed'
import selectIsochrone from 'lib/selectors/isochrone'

function TitleMessage({fetchStatus, project}) {
  const opportunityDataset = useSelector(activeOpportunityDataset)
  const isochrone = useSelector(selectIsochrone)
  const profileRequestHasChanged = useSelector(selectProfileRequestHasChanged)

  let title = 'Analyze results'
  if (fetchStatus) title = fetchStatus
  else if (!project) title = 'Select a project'
  else if (!isochrone) title = 'Compute travel time'
  else if (profileRequestHasChanged)
    title = 'Results are out of sync with settings'
  else if (!opportunityDataset)
    title = 'Select a destination layer to see accessibility'
  return <Text> {title}</Text>
}

export default function AnalysisTitle() {
  const dispatch = useDispatch()
  const isochroneFetchStatus = useSelector((s) =>
    get(s, 'analysis.isochroneFetchStatus')
  )
  const currentProject = useSelector(selectCurrentProject)
  const isFetchingIsochrone = !!isochroneFetchStatus

  function abort() {
    dispatch(abortFetch({type: FETCH_TRAVEL_TIME_SURFACE}))
    dispatch(setIsochroneFetchStatus(false))
  }

  return (
    <Flex
      align='center'
      borderBottomWidth='1px'
      justify='space-between'
      px={5}
      py={4}
      width='640px'
    >
      <Heading alignItems='center' display='flex' size='md'>
        <TitleMessage
          fetchStatus={isochroneFetchStatus}
          project={currentProject}
        />
      </Heading>
      {isFetchingIsochrone ? (
        <Button
          rightIcon={<XIcon />}
          onClick={abort}
          colorScheme='red'
          key='abort'
          size='lg'
        >
          Abort
        </Button>
      ) : (
        <Button
          isDisabled={!currentProject}
          rightIcon={<SyncIcon />}
          onClick={() => dispatch(fetchTravelTimeSurface())}
          colorScheme='blue'
          size='lg'
          title={
            !currentProject
              ? message('analysis.disableFetch')
              : message('analysis.refresh')
          }
        >
          {message('analysis.refresh')}
        </Button>
      )}
    </Flex>
  )
}
