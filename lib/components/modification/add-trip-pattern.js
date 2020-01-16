import React from 'react'

import {Text} from '../input'
import TransitModeSelector from '../transit-mode-selector'

import EditAlignment from './edit-alignment'
import Timetables from './timetables'

const blogLink =
  'https://blog.conveyal.com/upgraded-outreach-serverless-transit-accessibility-with-taui-f90d6d51e177'
const colorHelpText = `For display purposes (ex: with <a href="${blogLink}" target="_blank">Taui</a>). Must be a 6-digit hexadecimal number.`

/**
 * Display an add trip pattern modification
 */
export default function AddTripPattern(p) {
  return (
    <>
      <TransitModeSelector
        onChange={transitMode => p.update({transitMode})}
        value={p.modification.transitMode}
      />

      <Text
        className='DEV'
        label='Route Color'
        help={colorHelpText}
        onChange={e => p.update({color: e.currentTarget.value})}
        value={p.modification.color}
      />

      <EditAlignment
        allStops={p.allStops}
        disabled={false}
        mapState={p.mapState}
        modification={p.modification}
        numberOfStops={p.numberOfStops}
        segmentDistances={p.segmentDistances}
        setMapState={p.setMapState}
        update={p.update}
      />

      <Timetables
        bidirectional={p.modification.bidirectional}
        modificationStops={p.gtfsStops}
        numberOfStops={p.numberOfStops}
        qualifiedStops={p.qualifiedStops}
        projectTimetables={p.projectTimetables}
        segmentDistances={p.segmentDistances}
        setMapState={p.setMapState}
        timetables={p.modification.timetables}
        update={p.update}
      />
    </>
  )
}
