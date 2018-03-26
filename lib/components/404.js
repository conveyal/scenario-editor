// @flow
import React from 'react'

import InnerDock from './inner-dock'

export default () => (
  <InnerDock>
    <div className='block'>
      <div className='alert alert-danger'>
        <strong>404:</strong> This page does not exist. Redirecting home...
      </div>
    </div>
  </InnerDock>
)
