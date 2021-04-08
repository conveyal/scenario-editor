import fpGet from 'lodash/fp/get'
import React, {memo, useCallback, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import Select from 'lib/components/select'
import useInput from 'lib/hooks/use-controlled-input'
import useOnMount from 'lib/hooks/use-on-mount'

import {
  loadOpportunityDataset,
  loadOpportunityDatasets,
  setActiveOpportunityDataset
} from '../actions'
import * as select from '../selectors'

// By default, don't filter
const filterNone = () => true

const getOptionLabel = (d) => `${d.sourceName}: ${d.name}`
const getOptionValue = fpGet('_id')
const selectActiveDataset = fpGet('opportunityDatasets.activeDataset')

type SelectorProps = {
  filter?: (dataset: CL.SpatialDataset) => boolean
  isDisabled?: boolean
  regionId: string
}

export default memo<SelectorProps>(function OpportunityDatasetSelector({
  filter = filterNone,
  isDisabled = false,
  regionId
}) {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<any>()
  const activeDatasetId = useSelector<any, string>(selectActiveDataset)
  const allDatasets = useSelector<any, CL.SpatialDataset[]>(
    select.opportunityDatasets
  )

  const selectOpportunityDataset = useCallback(
    (dataset?: CL.SpatialDataset) => {
      if (!dataset) return dispatch(setActiveOpportunityDataset())
      setLoading(true)
      dispatch(loadOpportunityDataset(dataset)).finally(() => setLoading(false))
    },
    [dispatch, setLoading]
  )
  const input = useInput({
    onChange: selectOpportunityDataset,
    value: activeDatasetId
  })

  // Load datasets on mount
  useOnMount(() => {
    dispatch(loadOpportunityDatasets(regionId)).then(
      (datasets: CL.SpatialDataset[]) => {
        const activeDataset = datasets.find((d) => d._id === activeDatasetId)
        if (activeDataset) {
          setLoading(true)
          dispatch(loadOpportunityDataset(activeDataset)).finally(() =>
            setLoading(false)
          )
        }
      }
    )
  })

  return (
    <Select
      aria-label='Destination opportunity layer'
      name='select-opportunity-dataset'
      inputId='select-opportunity-dataset'
      isClearable
      isDisabled={isDisabled || loading}
      isLoading={loading}
      placeholder='Select a destination opportunity layer'
      ref={input.ref}
      options={allDatasets.filter(filter) as any}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      onChange={input.onChange}
      value={allDatasets.find((d) => d._id === input.value) as any}
    />
  )
})
