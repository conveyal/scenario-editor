import React from 'react'
import {format} from 'd3-format'

import {isLight} from 'lib/utils/rgb-color-contrast'

const textFormat = format(',.0f')

/** Display a map legend */
export default function Legend({breaks, colors, min}) {
  const formatText = i => {
    const bottom = i === 0 && min <= breaks[0] ? min : breaks[i - 1] + 1
    const top = breaks[i]
    return bottom === top
      ? bottom
      : `${textFormat(bottom)} to ${textFormat(top)}`
  }
  return (
    <div className='Legend'>
      {breaks.map((br, i) => (
        <div
          className='Legend-Item'
          key={`break-${i}`}
          style={{
            backgroundColor: `rgba(${colors[i].r}, ${colors[i].g}, ${colors[i].b}, 1)`,
            color: isLight(colors[i]) ? '#000' : '#fff'
          }}
        >
          {formatText(i)}
        </div>
      ))}
    </div>
  )
}
