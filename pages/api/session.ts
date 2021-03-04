import {NextApiRequest, NextApiResponse} from 'next'

import initAuth0, {getUser} from 'lib/auth0'

export default async function session(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const auth0 = initAuth0(req)
  await auth0.withApiAuthRequired(async (req, res) => {
    try {
      res.json(await getUser(req, res))
    } catch (error) {
      console.error(error)
      res.status(error.status || 500).end(error.message)
    }
  })(req, res)
}
