import {Box, Button, Heading, Stack} from '@chakra-ui/react'
import React from 'react'
import {useSelector} from 'react-redux'

import msg from 'lib/message'

import InnerDock from 'lib/components/inner-dock'
import Select from 'lib/components/select'
import useRouteTo from 'lib/hooks/use-route-to'

const selectResources = (s) => s.resources

export default function SelectResource(p) {
  const resources = useSelector(selectResources)
  const routeToResource = useRouteTo('resourceEdit')
  const _upload = useRouteTo('resourceUpload', {regionId: p.query.regionId})

  const _goToResource = (resource) =>
    routeToResource({
      regionId: resource.regionId,
      resourceId: resource._id
    })

  return (
    <InnerDock>
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
