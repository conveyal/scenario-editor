import {ObjectID} from 'mongodb'

import withApiAuthRequired from 'lib/auth/with-api-auth-required'
import {ADD_TRIP_PATTERN} from 'lib/constants'

import AuthenticatedCollection from 'lib/db/authenticated-collection'
import {withDefaultValues} from 'lib/modification/modification-default-values'
import {errorToPOJO} from 'lib/utils/api'

export default withApiAuthRequired(async function (req, res, user) {
  try {
    const projectId = req.body.projectId as string
    const partialModifications = req.body.modifications
    const modifications = await AuthenticatedCollection.with(
      'modifications',
      user
    )
    const newModifications = await modifications.createMany(
      partialModifications.map((m) =>
        withDefaultValues({
          ...m,
          _id: new ObjectID().toHexString(),
          projectId,
          transitMode: 3, // BUS, same as the R5 default
          type: ADD_TRIP_PATTERN
        })
      )
    )

    // TODO create a new entry for each modification in scenario-modifications

    res.status(201).json({
      message: `Successfully created ${newModifications.result.n} modifications`,
      ids: newModifications.ops.map((m) => m._id)
    })
  } catch (e) {
    res.status(400).json(errorToPOJO(e))
  }
})
