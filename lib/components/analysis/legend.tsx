import {Box, Stack} from '@chakra-ui/react'
import {format} from 'd3-format'
import reverse from 'lodash/reverse'

import {isLight} from 'lib/utils/rgb-color-contrast'

const textFormat = format(',.0f')

/** Display a map legend */
export default function Legend({breaks, colors, min}) {
  const formatText = (i) => {
    const bottom = i === 0 && min <= breaks[0] ? min : breaks[i - 1]
    const top = breaks[i]
    const text =
      bottom === top ? bottom : `${textFormat(top)} to ${textFormat(bottom)}`
    if (colors[i].opacity === 0) return `${text} (transparent)`
    return text
  }
  const breakProps = breaks.map((_, i) => ({
    backgroundColor: `rgba(${colors[i].r}, ${colors[i].g}, ${colors[i].b}, 1)`,
    color: isLight(colors[i]) ? '#000' : '#fff',
    children: formatText(i)
  }))

  return (
    <Stack borderTop='1px solid #E2E8F0' spacing={0}>
      {reverse(breakProps).map((props, i) => (
        <Box
          _last={{
            roundedBottom: 'md'
          }}
          px={4}
          py={1}
          key={`break-${i}`}
          {...props}
        />
      ))}
    </Stack>
  )
}
