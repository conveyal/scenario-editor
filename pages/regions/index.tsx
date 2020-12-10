// This page mimics the home page but without Server Side Rendering
import useUser from 'lib/hooks/use-user'

import IndexPage from '../'

export default function SelectRegion() {
  const user = useUser()
  return <IndexPage user={user} />
}
