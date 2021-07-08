import {get} from 'lodash'

import colors from 'lib/constants/colors'
import {useFeedStops, useRoutePatterns} from 'lib/gtfs/hooks'

import Pane from '../map/pane'

import PatternLayer from './pattern-layer'
import HopLayer from './hop-layer'

/** Map layer for an adjust speed modification */
export default function AdjustSpeedLayer(p: {
  bundleId: string
  dim?: boolean
  modification: CL.AdjustSpeed
}) {
  const allStops = useFeedStops(p.bundleId, p.modification.feed)
  const patterns = useRoutePatterns(
    p.bundleId,
    p.modification.feed,
    get(p.modification, 'routes[0]')
  )
  if (p.modification.hops) {
    return (
      <>
        <Pane zIndex={500}>
          <PatternLayer
            activeTrips={p.modification.trips}
            color={colors.NEUTRAL}
            dim={p.dim}
            bundleId={p.bundleId}
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
        bundleId={p.bundleId}
        modification={p.modification}
      />
    )
  }
}
