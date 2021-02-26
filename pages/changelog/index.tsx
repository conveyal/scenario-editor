import {faArrowLeft} from '@fortawesome/free-solid-svg-icons'
import {Box, Divider, Flex, Heading, Image, Stack} from '@chakra-ui/core'
import React from 'react'

import Icon from 'lib/components/icon'
import {ALink} from 'lib/components/link'

import C202102 from './202102.mdx'
import C202012 from './202012.mdx'
import C20200228 from './20200228.mdx'
import C201909 from './201909.mdx'
import C201910 from './201910.mdx'
import C20200210 from './20200210.mdx'
import C20200418 from './20200418.mdx'
import C202006 from './202006.mdx'
import C20200803 from './20200803.mdx'
import C20201007 from './20201007.mdx'

const changes = [
  ['February 2021', C202102],
  ['December, 2020', C202012],
  ['October, 2020', C20201007],
  ['August, 2020', C20200803],
  ['June, 2020', C202006],
  ['April 18th, 2020', C20200418],
  ['February 28th, 2020', C20200228],
  ['February 10th, 2020', C20200210],
  ['October 12th, 2019', C201910],
  ['September 13th, 2019', C201909]
]

const spacing = 12

export default function Changelog() {
  return (
    <Stack spacing={spacing} maxWidth='100ch' mx='auto' my={40}>
      <Flex justify='space-between'>
        <Heading size='2xl'>What&lsquo;s new</Heading>
        <Image display='inline-block' size='45px' src='/logo.svg' />
      </Flex>
      <Box fontSize='14px'>
        <ALink to='regions'>
          <Icon icon={faArrowLeft} /> Back to the application
        </ALink>
      </Box>
      {changes.map(([title, C], i) => (
        <Stack spacing={spacing} key={i}>
          <Divider />
          <Stack mt='2em'>
            <Heading size='2xl' textAlign='center'>
              {title}
            </Heading>
            <Heading
              color='gray.700'
              size='sm'
              style={{fontVariantCaps: 'small-caps'}}
              textAlign='center'
            >
              changelog
            </Heading>
          </Stack>
          <Box className='CL'>
            <C />
          </Box>
        </Stack>
      ))}
      <style jsx global>{`
        .CL {
          font-size: 14px;
          display: grid;
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
          margin-top: calc(1em / 2);
          margin-bottom: calc(2em / 2);
        }

        .CL p,
        .CL ul,
        .CL blockquote {
          margin-bottom: 2rem;
          line-height: 2rem;
        }

        .CL ul {
          padding-left: 2.5rem;
        }

        .CL img {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          max-height: 20rem;
          margin: 2rem auto;
          cursor: zoom-in;
        }

        .CL img:focus,
        .CL img:active {
          cursor: zoom-out;
          max-height: unset;
        }

        .CL a {
          color: #3182ce;
          text-decoration: underline;
        }
      `}</style>
    </Stack>
  )
}
