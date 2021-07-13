import withApiAuthRequired from 'lib/auth/with-api-auth-required'
import AuthenticatedCollection from 'lib/db/authenticated-collection'
import {errorToPOJO} from 'lib/utils/api'

export default withApiAuthRequired(async function (req, res, user) {
  try {
    const modificationId = req.query._id as string
    const scenariosModifications = await AuthenticatedCollection.with(
      'scenariosModifications',
      user
    )
    const allEntries = await scenariosModifications.collection
      .aggregate([
        {
          $match: {
            accessGroup: user.accessGroup,
            modificationId
          }
        },
        {
          $lookup: {
            from: 'scenarios',
            localField: 'scenarioId',
            foreignField: '_id',
            as: 'scenario'
          }
        },
        {
          $unwind: {
            path: '$scenario',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $addFields: {
            _id: '$scenarioId',
            name: '$scneario.name'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1
          }
        }
      ])
      .toArray()
    res.status(200).json(allEntries)
  } catch (e) {
    res.status(400).json(errorToPOJO(e))
  }
})
