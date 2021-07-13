import withCollection from 'lib/db/with-collection'
import {errorToPOJO} from 'lib/utils/api'

export default withCollection(
  'scenariosModifications',
  async function (req, res, scenariosModifications, user) {
    try {
      const scenarioId = req.query._id as string
      const allEntries = await scenariosModifications.collection
        .aggregate([
          {
            $match: {
              accessGroup: user.accessGroup,
              scenarioId
            }
          },
          {
            $lookup: {
              from: 'modifications',
              localField: 'modificationId',
              foreignField: '_id',
              as: 'modification'
            }
          },
          {
            $unwind: {
              path: '$modification',
              preserveNullAndEmptyArrays: false
            }
          },
          {
            $addFields: {
              _id: '$modificationId',
              name: '$modification.name'
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
  }
)
