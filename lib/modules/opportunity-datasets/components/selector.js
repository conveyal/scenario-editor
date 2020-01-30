import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import Select from 'lib/components/select'
import useOnMount from 'lib/hooks/use-on-mount'

import {
  loadOpportunityDataset,
  loadOpportunityDatasets,
  setActiveOpportunityDataset
} from '../actions'
import * as select from '../selectors'

export default function OpportunityDatasetSelector(p) {
  const {regionId} = p
  const [loading, setLoading] = React.useState(false)
  const dispatch = useDispatch()
  const activeDatasetId = useSelector(s => s.opportunityDatasets.activeDataset)
  const allDatasets = useSelector(select.opportunityDatasets)

  // Load datasets on mount
  useOnMount(() => {
    dispatch(loadOpportunityDatasets(regionId))
  })

  function selectOpportunityDataset(dataset) {
    if (!dataset) return dispatch(setActiveOpportunityDataset())
    setLoading(true)
    dispatch(loadOpportunityDataset(dataset)).finally(() => setLoading(false))
  }

  return (
    <Select
      isClearable
      isDisabled={p.isDisabled || loading}
      options={allDatasets}
      getOptionLabel={d => `${d.sourceName}: ${d.name}`}
      getOptionValue={d => d._id}
      onChange={selectOpportunityDataset}
      value={allDatasets.find(d => d._id === activeDatasetId)}
    />
  )
}
