// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'
import type {Children} from 'react'

import {Application, Dock, Title} from './base'

export default function Bundles ({children}: {children?: Children}) {
  return (
    <Application>
      <Title><Icon type='database' /> GTFS Bundles</Title>
      <Dock>{children}</Dock>
    </Application>
  )
}
