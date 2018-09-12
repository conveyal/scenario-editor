// @flow
import React from 'react'

import type {
  Modification,
  GTFSStop,
  MapState,
  Stop,
  Timetable
} from '../../types'

import EditAlignment from './edit-alignment'
import Timetables from './timetables'

type Props = {
  allPhaseFromTimetableStops: any,
  extendFromEnd: boolean,
  gtfsStops: GTFSStop[],
  mapState: MapState,
  modification: Modification,
  numberOfStops: number,
  projectTimetables: Timetable[],
  qualifiedStops: Stop[],
  segmentDistances: number[],
  setMapState: (MapState) => void,
  update: (any) => void
}

/**
 * Display an add trip pattern modification
 */
export const AddTripPattern = ({
  allPhaseFromTimetableStops,
  extendFromEnd,
  gtfsStops,
  mapState,
  modification,
  numberOfStops,
  qualifiedStops,
  projectTimetables,
  segmentDistances,
  setMapState,
  update
}: Props) => (
  <div>
    <EditAlignment
      extendFromEnd={extendFromEnd}
      mapState={mapState}
      modification={modification}
      numberOfStops={numberOfStops}
      segmentDistances={segmentDistances}
      setMapState={setMapState}
      update={update}
      disabled={false}
    />

    <Timetables
      allPhaseFromTimetableStops={allPhaseFromTimetableStops}
      bidirectional={modification.bidirectional}
      modificationStops={gtfsStops}
      numberOfStops={numberOfStops}
      qualifiedStops={qualifiedStops}
      projectTimetables={projectTimetables}
      segmentDistances={segmentDistances}
      setMapState={setMapState}
      timetables={modification.timetables}
      update={update}
    />
  </div>
)
