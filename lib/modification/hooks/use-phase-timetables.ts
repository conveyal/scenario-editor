import {useMemo} from 'react'

import {toString as timetableToString} from 'lib/utils/timetable'

import useProjectModifications from './use-project-modifications'

type PhaseOption = {
  /**
   * Timetable id prepended with the modification id
   */
  phaseId: string
  /**
   * Modification name + stringified timetable
   */
  phaseLabel: string
  /**
   * Base timetable
   */
  timetable: CL.AbstractTimetable
}

export default function usePhaseAvailableTimetables() {
  const modifications = useProjectModifications()
  return useMemo(() => {
    const timetables: PhaseOption[] = []
    for (const m of modifications) {
      if (m.type === 'add-trip-pattern') {
        if (m.bidirectional) continue
        timetables.push(...filterAndConvert(m)(m.timetables))
      } else if (m.type === 'convert-to-frequency') {
        timetables.push(...filterAndConvert(m)(m.entries))
      }
    }
    return timetables
  }, [modifications])
}

const filterAndConvert =
  (m: CL.IModification) =>
  (a: CL.AbstractTimetable[]): PhaseOption[] =>
    a
      .filter((t) => t._id && !t.exactTimes)
      .map((t) => ({
        phaseId: `${m._id}:${t._id}`,
        phaseLabel: `${m.name}: ${timetableToString(t)}`,
        timetable: t
      }))
