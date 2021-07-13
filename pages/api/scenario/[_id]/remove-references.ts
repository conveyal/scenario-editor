import withCollection from 'lib/db/with-collection'
import {errorToPOJO} from 'lib/utils/api'

export default withCollection(
  'scenariosModifications',
  async function (req, res, scenariosModifications, user) {
    try {
      const scenarioId = req.query._id as string
      const op = await scenariosModifications.collection.deleteMany({
        accessGroup: user.accessGroup,
        scenarioId
      })
      res.status(200).json({
        count: op.deletedCount
      })
    } catch (e) {
      res.status(400).json(errorToPOJO(e))
    }
  }
)
