import {NextApiRequest, NextApiResponse} from 'next'

import auth0, {getSession} from 'lib/auth0'

export default auth0.requireAuthentication(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getSession(req)
      res.json(session)
    } catch (error) {
      console.error(error)
      res.status(error.status || 500).end(error.message)
    }
  }
)
