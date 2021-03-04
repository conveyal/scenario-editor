// This page mimics the home page but without Server Side Rendering
import withAuth from 'lib/with-auth'

import IndexPage from '../'

export default withAuth(function SelectRegion({user}) {
  return <IndexPage user={user} />
})
