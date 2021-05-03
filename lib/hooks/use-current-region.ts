import {useRouter} from 'next/router'

import {useRegion} from './use-model'

export default function useCurrentRegion(): CL.Region | void {
  const router = useRouter()
  const query = router.query as CL.Query
  const response = useRegion(query.regionId)
  return response.data
}
