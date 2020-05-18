import React from 'react'
import {useRouter} from 'next/router'

import Heading from 'lib/modules/opportunity-datasets/components/heading'
import Upload from 'lib/modules/opportunity-datasets/components/upload'
import MapLayout from 'lib/layouts/map'

export default function OpportunitiesUpload(p) {
  const router = useRouter()
  return (
    <Heading>
      <Upload {...p} regionId={router.query.regionId} />
    </Heading>
  )
}

OpportunitiesUpload.Layout = MapLayout
