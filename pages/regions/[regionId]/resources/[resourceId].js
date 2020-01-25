import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Heading,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tag,
  Text
} from '@chakra-ui/core'
import format from 'date-fns/format'
import dynamic from 'next/dynamic'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch} from 'react-redux'

import {
  deleteResource,
  loadAllResources,
  loadResource,
  loadResourceData
} from 'lib/actions/resources'
import SelectResource from 'lib/components/select-resource'
import msg from 'lib/message'
import downloadData from 'lib/utils/download-data'
import {routeTo} from 'lib/router'
import withInitialFetch from 'lib/with-initial-fetch'

const GeoJSON = dynamic(() => import('lib/components/map/geojson'), {
  ssr: false
})

function dateFromObjectId(objectId) {
  return format(
    new Date(parseInt(objectId.substring(0, 8), 16) * 1000),
    'yyyy-MM-DD HH:mm:ss'
  )
}

function ConfirmDelete(p) {
  const [isOpen, setIsOpen] = React.useState()
  const cancelRef = React.useRef()
  const onClose = () => setIsOpen(false)
  const onDelete = () => {
    p.onDelete()
    onClose()
  }

  return (
    <>
      <Button block variantColor='red' onClick={() => setIsOpen(true)}>
        {msg('resources.deleteAction')}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>{msg('resources.deleteAction')}</AlertDialogHeader>
          <AlertDialogBody>
            {msg('resources.deleteConfirmation')}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              {msg('common.cancel')}
            </Button>
            <Button variantColor='red' onClick={onDelete} ml={3}>
              {msg('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function EditResource(p) {
  const dispatch = useDispatch()
  const router = useRouter()
  const [resourceData, setResourceData] = React.useState()
  const {resource, setMapChildren} = p

  // Load the resource data on client side mount
  React.useEffect(() => {
    dispatch(loadResourceData(resource)).then(setResourceData)
  }, [dispatch, resource])

  // Show the resource on the map
  React.useEffect(() => {
    if (resourceData) {
      setMapChildren(<GeoJSON data={resourceData} />)
    }

    return () => setMapChildren(<React.Fragment />)
  }, [resourceData, setMapChildren])

  function _download() {
    downloadData(resourceData, resource.filename, resource.type)
  }

  function _delete() {
    dispatch(deleteResource(resource)).then(() => {
      const {as, href} = routeTo('resources', {regionId: resource.regionId})
      router.push(href, as)
    })
  }

  return (
    <SelectResource {...p}>
      <Stack mt={6}>
        <Heading size='lg'>{resource.name}</Heading>
        <Text fontSize='xl'>{resource.filename}</Text>
        <Stack isInline spacing={1}>
          <Tag>{resource.type}</Tag>
          <Tag>{resource.contentType}</Tag>
        </Stack>
        <StatGroup>
          <Stat>
            <StatLabel>{msg('common.created')}</StatLabel>
            <StatNumber>{dateFromObjectId(resource._id)}</StatNumber>
            <StatHelpText>{resource.createdBy}</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>{msg('common.updated')}</StatLabel>
            <StatNumber>{dateFromObjectId(resource.nonce)}</StatNumber>
            <StatHelpText>{resource.updatedBy}</StatHelpText>
          </Stat>
        </StatGroup>
        <Button
          block
          disabled={!resourceData}
          onClick={_download}
          variantColor='green'
        >
          {msg('common.download')}
        </Button>
        <ConfirmDelete onDelete={_delete} />
      </Stack>
    </SelectResource>
  )
}

async function initialFetch(store, query) {
  return {
    resource: await store.dispatch(loadResource(query.resourceId)),
    resources: await store.dispatch(loadAllResources(query))
  }
}

export default withInitialFetch(EditResource, initialFetch)
