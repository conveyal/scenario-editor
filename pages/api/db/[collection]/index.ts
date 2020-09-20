import {NextApiResponse, NextApiRequest} from 'next'

import auth0 from 'lib/auth0'
import AuthenticatedCollection from 'lib/db/authenticated-collection'

const getAsString = (p: string | string[]) => (Array.isArray(p) ? p[0] : p)
const getAsObject = (p: string | string[]): Record<string, unknown> => {
  try {
    return JSON.parse(getAsString(p))
  } catch (e) {
    return {}
  }
}

export default auth0.requireAuthentication(async function collection(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const collectionName = getAsString(req.query.collection)
  const collection = await AuthenticatedCollection.initialize(
    req,
    res,
    collectionName
  )

  switch (req.method) {
    case 'GET': {
      try {
        const query = getAsObject(req.query.query)
        const options = getAsObject(req.query.options)
        const documents = await collection.findWhere(query, options).toArray()
        res.json(documents)
      } catch (e) {
        res.status(400).json({message: 'Error finding documents.', error: e})
      }
      break
    }
    case 'POST': {
      try {
        const document = await collection.create(req.body)
        res.status(201).json(document.ops[0])
      } catch (e) {
        res.status(400).json({message: 'Error creating document.', error: e})
      }
      break
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
})
