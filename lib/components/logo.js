import React from 'react'

import {LOGO_URL} from 'lib/constants'

const logo = {
  fontFamily: `'Gill Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif`,
  fontSize: '36px',
  display: 'inline-block',
  letterSpacing: 0,
  paddingLeft: '5.5rem',
  backgroundImage: `url(${LOGO_URL})`,
  backgroundSize: '4rem',
  lineHeight: '4rem',
  backgroundRepeat: 'no-repeat',
  fontWeight: 100,
  whiteSpace: 'nowrap'
}

export default function Logo() {
  return (
    <div className='page-header text-center' style={{borderBottom: 'none'}}>
      <h1 style={logo}>conveyal analysis</h1>
    </div>
  )
}
