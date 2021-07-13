import fpOmit from 'lodash/fp/omit'
import {ObjectID} from 'mongodb'

import withApiAuthRequired from 'lib/auth/with-api-auth-required'
import AuthenticatedCollection from 'lib/db/authenticated-collection'
import {errorToPOJO} from 'lib/utils/api'

const omitId = fpOmit(['_id'])

/**
 * TODO create a new entry for each modification in scenario-modifications
 */
export default withApiAuthRequired(async function (req, res, user) {
  try {
    const fromProjectId = req.body.fromProjectId as string
    const fromBundleId = req.body.fromBundleId as string
    const toProjectId = req.body.toProjectId as string
    const toBundleId = req.body.toBundleId as string
    const bundlesAreNotEqual = fromBundleId !== toBundleId
    const modifications = await AuthenticatedCollection.with(
      'modifications',
      user
    )

    if (bundlesAreNotEqual) {
      const findQuery = {
        projectId: fromProjectId,
        type: {$in: ['add-trip-pattern', 'convert-to-frequency']}
      }
      const fromModifications = await modifications
        .findWhere(findQuery)
        .toArray()
      const newModificationIds = fromModifications.map(
        async (mod: CL.AddTripPattern) => {
          const newModificationBody = {
            ...omitId(mod),
            name: `${mod.name} + (import)`,
            projectId: toProjectId,
            bundleId: toBundleId,
            segments: mod.segments.map((s) => ({
              ...s,
              fromStopId: null,
              toStopId: null
            })),
            timetables: mod.timetables.map((t) => ({
              ...t,
              _id: new ObjectID().toHexString(),
              phaseAtStop: null,
              phaseFromStop: null,
              phaseFromTimetable: null
            }))
          }
          const response = await modifications.create(newModificationBody)

          return response.ops[0]._id
        }
      )
      return res.status(201).json(newModificationIds)
    } else {
      // Match up old and new modifications and timetables for phasing
      const modificationIdPairs = new Map<string, string>()
      const timetableIdPairs = new Map<string, string>()
      const fromModifications: CL.Modification[] = await modifications
        .findWhere({
          projectId: fromProjectId
        })
        .toArray()
      // First pass: create modifications with new ids while storing the pairs to the old ids.
      fromModifications.forEach(async (mod) => {
        const newModificationBody = {
          ...omitId(mod),
          name: `${mod.name} + (import)`,
          projectId: toProjectId,
          bundleId: toBundleId
        }
        const response = await modifications.create(newModificationBody)
        const newModification = response.ops[0]
        modificationIdPairs.set(mod._id, newModification._id)

        switch (mod.type) {
          case 'add-trip-pattern': {
            const atp = newModification as CL.AddTripPattern
            atp.timetables.forEach((t) => {
              const oldId = t._id
              t._id = new ObjectID().toHexString()
              timetableIdPairs.set(t._id, oldId)
            })
            break
          }
          case 'convert-to-frequency': {
            const ctf = newModification as CL.ConvertToFrequency
            ctf.entries.forEach((t) => {
              const oldId = t._id
              t._id = new ObjectID().toHexString()
              timetableIdPairs.set(t._id, oldId)
            })
            break
          }
        }
      })

      // Second pass, match phasing pairs with new ids.
      const newIds = fromModifications.map(async (mod) => {
        switch (mod.type) {
          case 'add-trip-pattern': {
            const atp = mod as CL.AddTripPattern
            atp.timetables.forEach((tt) => {
              const pft = tt.phaseFromTimetable
              if (pft?.length > 0) {
                const pfts = pft.split(':')
                tt.phaseFromTimetable = `${modificationIdPairs.get(
                  pfts[0]
                )}:${timetableIdPairs.get(pfts[1])}`
              }
            })
            break
          }
          case 'convert-to-frequency': {
            const ctf = mod as CL.ConvertToFrequency
            ctf.entries.forEach((tt) => {
              const pft = tt.phaseFromTimetable
              if (pft?.length > 0) {
                const pfts = pft.split(':')
                tt.phaseFromTimetable = `${modificationIdPairs.get(
                  pfts[0]
                )}:${timetableIdPairs.get(pfts[1])}`
              }
            })
            break
          }
        }
        await modifications.update(mod._id, mod)

        return mod._id
      })
      return res.status(201).json(newIds)
    }
  } catch (e) {
    res.status(400).json(errorToPOJO(e))
  }
})
