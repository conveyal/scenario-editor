import {Box, Button, Heading, Stack} from '@chakra-ui/react'
import {useRouter} from 'next/router'
import React from 'react'
import {useSelector} from 'react-redux'

import msg from 'lib/message'

import InnerDock from 'lib/components/inner-dock'
import Select from 'lib/components/select'
import {routeTo} from 'lib/router'

const selectResources = (s) => s.resources

export default function SelectResource(p) {
  const resources = useSelector(selectResources)
  const router = useRouter()

  function _goToResource(resource) {
    const {as, href} = routeTo('resourceEdit', {
      regionId: resource.regionId,
      resourceId: resource._id
    })
    router.push(href, as)
  }

  function _upload() {
    const {as, href} = routeTo('resourceUpload', {regionId: p.query.regionId})
    router.push(href, as)
  }

  return (
    <InnerDock p={4}>
      <Stack spacing={4}>
        <Heading size='md'>{msg('resources.title')}</Heading>
        <Button onClick={_upload} colorScheme='green'>
          {msg('resources.uploadAction')}
        </Button>
        <Box>
          <Select
            getOptionLabel={(r) => `${r.name} [${r.type}]`}
            getOptionValue={(r) => r._id}
            onChange={_goToResource}
            options={resources}
            value={resources.find((r) => r._id === p.query.resourceId)}
          />
        </Box>
      </Stack>
      {p.children}
    </InnerDock>
  )
}
