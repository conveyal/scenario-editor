// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

import messages from '../utils/messages'
import type {Region} from '../types'

type Props = {
  children?: any,
  region?: Region,
}

export default ({children, region}: Props) => region
  ? <div>
    <div className='ApplicationDockTitle'>
      <Icon type='map-o' /> {region.name}
    </div>

    {children}
  </div>
  : <div className='block'>
    {messages.region.loadingRegion}
  </div>
