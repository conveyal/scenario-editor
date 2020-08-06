import {faArrowLeft, faCalendarCheck} from '@fortawesome/free-solid-svg-icons'
import {Box, Divider, Flex, Heading, Image, Link, Stack} from '@chakra-ui/core'
import React from 'react'

import Icon from 'lib/components/icon'

import C20200228 from './20200228.mdx'
import C201909 from './201909.mdx'
import C201910 from './201910.mdx'
import C20200210 from './20200210.mdx'
import C20200418 from './20200418.mdx'
import C202006 from './202006.mdx'
import C20200803 from './20200803.mdx'

const changes = [
  ['August, 2020', C20200803],
  ['June, 2020', C202006],
  ['April 18th, 2020', C20200418],
  ['February 28th, 2020', C20200228],
  ['February 10th, 2020', C20200210],
  ['October 12th, 2019', C201910],
  ['September 13th, 2019', C201909]
]

const spacing = 10

export default function Changelog() {
  return (
    <Stack spacing={spacing} m={40}>
      <Flex justify='space-between'>
        <Heading size='2xl'>What&lsquo;s new</Heading>
        <Image display='inline-block' size='45px' src='/logo.svg' />
      </Flex>
      <Link
        color='blue.500'
        fontSize='14px'
        textDecoration='underline'
        href='/'
      >
        <Icon icon={faArrowLeft} /> Back to the application
      </Link>
      {changes.map(([title, C], i) => (
        <Stack spacing={spacing} key={i}>
          <Divider />
          <Heading size='xl'>
            <Icon icon={faCalendarCheck} /> {title}
          </Heading>
          <Box className='CL'>
            <C />
          </Box>
        </Stack>
      ))}
      <style jsx global>{`
        .CL {
          font-size: 14px;
        }

        .CL h1 {
          font-size: 2.5rem;
        }
        .CL h2 {
          font-size: 2.25rem;
        }
        .CL h3 {
          font-size: 2rem;
        }
        .CL h4 {
          font-size: 1.75rem;
        }
        .CL h5 {
          font-size: 1.5rem;
        }
        .CL h6 {
          font-size: 1.25rem;
        }

        .CL h1,
        .CL h2,
        .CL h3,
        .CL h4 {
          margin-bottom: calc(1em / 2);
        }

        .CL p {
          margin-bottom: 2rem;
        }

        .CL ul {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .CL li {
          margin-bottom: 0.5rem;
        }

        .CL img {
          display: inline-block;
        }

        .CL a {
          color: #3182ce;
          text-decoration: underline;
        }
      `}</style>
    </Stack>
  )
}
