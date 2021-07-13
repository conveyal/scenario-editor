import {ObjectID} from 'mongodb'

import withApiAuthRequired from 'lib/auth/with-api-auth-required'
import AuthenticatedCollection from 'lib/db/authenticated-collection'
import {ADD_TRIP_PATTERN, CONVERT_TO_FREQUENCY} from 'lib/constants'
import {errorToPOJO} from 'lib/utils/api'

function mapPhaseIds(
  timetables: CL.AbstractTimetable[],
  oldId: CL.ObjectID,
  newId: CL.ObjectID
) {
  const timetableIdPairs = new Map<CL.ObjectID, CL.ObjectID>()
  // First pass, create the new ids
  timetables.forEach((tt) => {
    const newId = new ObjectID().toHexString()
    timetableIdPairs.set(tt._id, newId)
    tt._id = newId
  })

  timetables.forEach((tt) => {
    if (
      tt.phaseFromTimetable?.length > 0 &&
      tt.phaseFromTimetable.indexOf(oldId) !== -1
    ) {
      const oldPftt = tt.phaseFromTimetable.split(':')
      tt.phaseFromTimetable = `${newId}:${timetableIdPairs.get(oldPftt[1])}`
    }
  })
}

/**
 * TODO create a new entry for each modification in scenario-modifications
 */
export default withApiAuthRequired(async function (req, res, user) {
  try {
    const modificationId = req.query._id as CL.ObjectID
    const modifications = await AuthenticatedCollection.with(
      'modifications',
      user
    )
    const modification: CL.Modification = await modifications.findOne(
      modificationId
    )

    const response = await modifications.create({
      ...modification,
      name: `${modification.name} (copy)`
    })
    const newModification = response.ops[0] as CL.Modification

    if (newModification.type === ADD_TRIP_PATTERN) {
      mapPhaseIds(
        (newModification as CL.AddTripPattern).timetables,
        modificationId,
        newModification._id
      )
      await modifications.update(newModification._id, newModification)
    } else if (newModification.type === CONVERT_TO_FREQUENCY) {
      mapPhaseIds(
        (newModification as CL.ConvertToFrequency).entries,
        modificationId,
        newModification._id
      )
      await modifications.update(newModification._id, newModification)
    }

    res.status(201).json({_id: newModification._id})
  } catch (e) {
    res.status(400).json(errorToPOJO(e))
  }
})
