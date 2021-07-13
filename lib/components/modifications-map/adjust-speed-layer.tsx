import colors from 'lib/constants/colors'
import {useFeedStops} from 'lib/gtfs/hooks'

import Pane from '../map/pane'

import PatternLayer from './pattern-layer'
import HopLayer from './hop-layer'
import useModificationPatterns from 'lib/modification/hooks/use-modification-patterns'

/** Map layer for an adjust speed modification */
export default function AdjustSpeedLayer(p: {
  bundle: CL.Bundle
  dim?: boolean
  modification: CL.AdjustSpeed
}) {
  const allStops = useFeedStops(p.bundle._id, p.modification.feed)
  const patterns = useModificationPatterns(p.bundle, p.modification)
  if (p.modification.hops) {
    return (
      <>
        <Pane zIndex={500}>
          <PatternLayer
            activeTrips={p.modification.trips}
            color={colors.NEUTRAL}
            dim={p.dim}
            bundleId={p.bundle._id}
            modification={p.modification}
          />
        </Pane>
        <Pane zIndex={501}>
          <HopLayer
            color={colors.MODIFIED}
            hops={p.modification.hops}
            patterns={patterns}
            stops={allStops}
          />
        </Pane>
      </>
    )
  } else {
    return (
      <PatternLayer
        activeTrips={p.modification.trips}
        color={colors.MODIFIED}
        dim={p.dim}
        bundleId={p.bundle._id}
        modification={p.modification}
      />
    )
  }
}
