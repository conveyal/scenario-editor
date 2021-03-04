import {NextApiRequest, NextApiResponse} from 'next'

import initAuth0 from 'lib/auth0'

export default async function auth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const auth0 = initAuth0(req)
  const handler = auth0.handleAuth()
  await handler(req, res)
}
