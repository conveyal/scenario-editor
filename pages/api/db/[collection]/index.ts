import {withCollectionFromQueryParameter} from 'lib/db/with-collection'
import {errorToPOJO, getQueryAsObject} from 'lib/utils/api'

export default withCollectionFromQueryParameter(
  async (req, res, collection) => {
    switch (req.method) {
      case 'GET': {
        try {
          const query = getQueryAsObject(req.query.query)
          const options = getQueryAsObject(req.query.options)
          const documents = await collection.findWhere(query, options).toArray()
          res.json(documents)
        } catch (e) {
          res.status(400).json({
            description: 'Error finding documents.',
            error: errorToPOJO(e)
          })
        }
        break
      }
      case 'POST': {
        try {
          const document = await collection.create(req.body)
          res.status(201).json(document.ops[0])
        } catch (e) {
          res.status(400).json({
            description: 'Error creating document.',
            error: errorToPOJO(e)
          })
        }
        break
      }
      default: {
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({description: `Method ${req.method} Not Allowed`})
      }
    }
  }
)
