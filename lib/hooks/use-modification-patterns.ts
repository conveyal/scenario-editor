import {useEffect, useState} from 'react'

import {getPatternsForModification} from 'lib/utils/patterns'

export default function useModificationPatterns({
  activeTrips = [],
  dim = false,
  feed,
  modification
}) {
  const [patterns, setPatterns] = useState(() =>
    getPatternsForModification({activeTrips, dim, feed, modification})
  )
  useEffect(() => {
    setPatterns(
      getPatternsForModification({activeTrips, dim, feed, modification})
    )
  }, [activeTrips, dim, feed, modification])
  return patterns
}
