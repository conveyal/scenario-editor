import {FormControl, FormLabel} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import {useState} from 'react'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import Select from './select'

const getLabel = fpGet('name')
const getValue = fpGet('_id')

export default function SelectBundle({
  bundles,
  query
}: {
  bundles: CL.Bundle[]
  query: CL.Query
}) {
  const [bundleId, setBundleId] = useState(query.bundleId)
  const goToBundleEdit = useRouteTo('bundle', {regionId: query.regionId})
  return (
    <FormControl>
      <FormLabel htmlFor='selectBundle' textAlign='center'>
        {message('bundle.select')}
      </FormLabel>
      <div>
        <Select
          inputId='selectBundle'
          options={bundles}
          getOptionLabel={getLabel}
          getOptionValue={getValue}
          onChange={(result: CL.Bundle) => {
            setBundleId(result._id)
            goToBundleEdit({bundleId: result._id})
          }}
          value={bundles.find((b) => b._id === bundleId)}
        />
      </div>
    </FormControl>
  )
}
