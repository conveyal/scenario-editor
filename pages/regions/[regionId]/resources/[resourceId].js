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
} from '@chakra-ui/react'
import format from 'date-fns/format'
import dynamic from 'next/dynamic'
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
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'
import useRouteTo from 'lib/hooks/use-route-to'

const GeoJSON = dynamic(() => import('lib/components/map/geojson'), {
  ssr: false
})

function dateFromObjectId(objectId) {
  return format(
    new Date(parseInt(objectId.substring(0, 8), 16) * 1000),
    'yyyy-MM-dd HH:mm:ss'
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
      <Button colorScheme='red' onClick={() => setIsOpen(true)}>
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
            <Button colorScheme='red' onClick={onDelete} ml={3}>
              {msg('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const EditResourcePage = withInitialFetch(
  function EditResource(p) {
    const dispatch = useDispatch()
    const [resourceData, setResourceData] = React.useState()
    const {resource} = p
    const routeToResources = useRouteTo('resources', {
      regionId: resource.regionId
    })

    // Load the resource data on client side mount
    React.useEffect(() => {
      dispatch(loadResourceData(resource)).then(setResourceData)
    }, [dispatch, resource])

    function _download() {
      downloadData(resourceData, resource.filename, resource.type)
    }

    function _delete() {
      dispatch(deleteResource(resource)).then(() => routeToResources())
    }

    return (
      <SelectResource {...p}>
        {resourceData && <GeoJSON data={resourceData} />}
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
            isDisabled={!resourceData}
            onClick={_download}
            colorScheme='green'
          >
            {msg('common.download')}
          </Button>
          <ConfirmDelete onDelete={_delete} />
        </Stack>
      </SelectResource>
    )
  },
  async (dispatch, query) => {
    return {
      resource: await dispatch(loadResource(query.resourceId)),
      resources: await dispatch(loadAllResources(query))
    }
  }
)

EditResourcePage.Layout = MapLayout

export default EditResourcePage
