import React from 'react'

import getInitialAuth from 'lib/get-initial-auth'
import Heading from 'lib/modules/opportunity-datasets/components/heading'
import Upload from 'lib/modules/opportunity-datasets/components/upload'

export default function OpportunitiesUpload(p) {
  return (
    <Heading>
      <Upload {...p} regionId={p.query.regionId} />
    </Heading>
  )
}

OpportunitiesUpload.getInitialProps = getInitialAuth
