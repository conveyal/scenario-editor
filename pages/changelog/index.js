import {Box, Divider, Heading, Link, Stack} from '@chakra-ui/core'
import React from 'react'

import C201909 from './201909.mdx'
import C201910 from './201910.mdx'
import C20200210 from './20200210.mdx'

const changes = [
  ['February 10th, 2020', C20200210],
  ['October 12th, 2019', C201910],
  ['September 13th, 2019', C201909]
]

export default function Changelog() {
  return (
    <Stack spacing={10} p={20}>
      <Heading size='2xl'>
        Conveyal Analysis Changelog{' '}
        <Link color='blue.500' href='/'>
          Back to Analysis
        </Link>
      </Heading>
      {changes.map(([title, C], i) => (
        <Box key={i}>
          <Heading mb={5} size='xl'>
            {title}
          </Heading>
          <Box className='CL'>
            <C />
          </Box>
        </Box>
      ))}
      <style jsx global>{`
        .CL h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .CL h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .CL p {
          margin-bottom: 1rem;
        }

        .CL ul {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .CL img {
          display: inline-block;
        }
      `}</style>
    </Stack>
  )
}
