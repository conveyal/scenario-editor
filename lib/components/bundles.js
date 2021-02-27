import {Button, Heading, Stack, Text} from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

import message from 'lib/message'
import {toHref} from 'lib/router'

import DocsLink from './docs-link'
import InnerDock from './inner-dock'

export default function Bundles({children, regionId}) {
  return (
    <InnerDock style={{width: '640px'}}>
      <Stack spacing={8} p={8}>
        <Heading size='lg'>{message('nav.networkBundles')}</Heading>
        <Text>
          {message('bundle.explanation')} <DocsLink to='prepare-inputs' />
        </Text>
        <Link href={toHref('bundleCreate', {regionId})}>
          <Button size='lg' colorScheme='green'>
            {message('bundle.create')}
          </Button>
        </Link>
        {children}
      </Stack>
    </InnerDock>
  )
}
