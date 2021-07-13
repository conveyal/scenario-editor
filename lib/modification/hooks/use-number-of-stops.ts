import {useMemo} from 'react'

import getStops from 'lib/utils/get-stops'

export default function useNumberOfStops(
  modification: CL.SegmentsModification
) {
  return useMemo(() => {
    return getStops(modification.segments)?.length
  }, [modification.segments])
}
