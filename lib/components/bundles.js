import {Button, Heading, Stack, Text} from '@chakra-ui/react'
import React from 'react'

import message from 'lib/message'

import DocsLink from './docs-link'
import InnerDock from './inner-dock'
import Link from './link'

export default function Bundles({children, regionId}) {
  return (
    <InnerDock style={{width: '640px'}}>
      <Stack spacing={8} p={8}>
        <Heading size='lg'>{message('nav.networkBundles')}</Heading>
        <Text>
          {message('bundle.explanation')} <DocsLink to='prepare-inputs' />
        </Text>
        <Link to='bundleCreate' regionId={regionId}>
          <Button size='lg' colorScheme='green'>
            {message('bundle.create')}
          </Button>
        </Link>
        {children}
      </Stack>
    </InnerDock>
  )
}
