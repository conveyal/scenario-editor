import lowerCase from 'lodash/lowerCase'
import startCase from 'lodash/startCase'

import {withCollectionFromQueryParameter} from 'lib/db/with-collection'
import {errorToPOJO, getQueryAsObject, getQueryAsString} from 'lib/utils/api'

export default withCollectionFromQueryParameter(
  async (req, res, collection) => {
    const _id = getQueryAsString(req.query._id)
    switch (req.method) {
      case 'GET': {
        try {
          const options = getQueryAsObject(req.query.options)
          const document = await collection.findOne(_id, options)
          if (!document) {
            res.status(404).end()
          } else {
            res.json(document)
          }
        } catch (e) {
          res.status(400).json({
            description: `Error getting ${lowerCase(collection.singularName)}.`,
            error: errorToPOJO(e) // possibly only do when user is admin?
          })
        }
        break
      }
      case 'PUT': {
        try {
          const updateResult = await collection.update(_id, req.body)
          if (!updateResult || !updateResult.ok || !updateResult.value) {
            res.status(404).json({
              description: `${startCase(
                collection.singularName
              )} does not exist.`
            })
          } else {
            res.json(updateResult.value)
          }
        } catch (e) {
          res.status(400).json({
            description: `Error updating ${lowerCase(
              collection.singularName
            )}.`,
            error: errorToPOJO(e)
          })
        }
        break
      }
      case 'DELETE': {
        try {
          const result = await collection.remove(_id)
          if (result) {
            res.status(200).json({
              description: `${startCase(
                collection.singularName
              )} has been deleted.`
            })
          } else {
            res.status(400).json({
              description: `${startCase(
                collection.singularName
              )} deletion has failed.`
            })
          }
        } catch (e) {
          res.status(400).json({
            description: `Error deleting ${lowerCase(
              collection.singularName
            )}.`,
            error: errorToPOJO(e)
          })
        }
        break
      }
      default: {
        res.setHeader('Allow', ['DELETE', 'GET', 'PUT'])
        res.status(405).json({description: `Method ${req.method} Not Allowed`})
      }
    }
  }
)
