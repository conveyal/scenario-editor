import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  useToast,
  Skeleton
} from '@chakra-ui/react'
import {FormEvent, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'

import fetch from 'lib/actions/fetch'
import {API, SERVER_NGINX_MAX_CLIENT_BODY_SIZE} from 'lib/constants'
import useActivity from 'lib/hooks/use-activity'
import {useBundles} from 'lib/hooks/use-collection'
import useFileInput from 'lib/hooks/use-file-input'
import {useRegion} from 'lib/hooks/use-model'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import Code from './code'
import FileSizeInputHelper from './file-size-input-helper'
import InnerDock from './inner-dock'
import DocsLink from './docs-link'

/**
 * Create bundle form.
 */
export default function CreateBundle({query}: {query: CL.Query}) {
  const {response: activityResponse} = useActivity()
  const dispatch = useDispatch<any>()
  const {regionId} = query
  const {data: bundles} = useBundles({query: {regionId}})
  const {data: region} = useRegion(regionId)
  const toast = useToast()
  const bounds = region?.bounds ?? {
    north: 90,
    south: -90,
    east: 180,
    west: -180
  }
  const formRef = useRef<HTMLFormElement>()
  const goToBundles = useRouteTo('bundles', {regionId})

  const hasExistingBundles = bundles?.length > 0
  const dataIsLoaded = Array.isArray(bundles) && !!region
  const [reuseOsm, setReuseOsm] = useState(false)
  const osm = useFileInput()
  const feedGroup = useFileInput()
  const [reuseGtfs, setReuseGtfs] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({
    name: ''
  })
  const onChange = (propName: string) => (e) => {
    // Since `target` will not exist if used in the function call below, extract
    // value first.
    const value = e.target.value
    setFormData((d) => ({...d, [propName]: value}))
  }

  const isValid = () =>
    osm.totalSize + feedGroup.totalSize < SERVER_NGINX_MAX_CLIENT_BODY_SIZE &&
    ((reuseOsm && formData.osmId) || (!reuseOsm && osm.files?.length > 0)) &&
    ((reuseGtfs && formData.feedGroupId) ||
      (!reuseGtfs && feedGroup.files?.length > 0))

  async function submit(e: FormEvent<HTMLFormElement>) {
    // don't submit the form
    e.preventDefault()

    const formElement = e.currentTarget
    const body = new window.FormData(formElement)

    if (reuseGtfs) body.delete('feedGroup')
    else body.delete('feedGroupId')

    if (reuseOsm) body.delete('osm')
    else body.delete('osmId')

    if (isValid()) {
      setUploading(true)

      try {
        await dispatch(
          fetch({
            url: API.Bundle,
            options: {body, method: 'post'}
          })
        )
        // Show the new activity
        await activityResponse.revalidate()
        // Redirect to the bundles page
        goToBundles()
      } catch (e) {
        toast({
          title: 'Error creating bundle',
          description: e.message,
          position: 'top',
          status: 'error',
          isClosable: true
        })
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <InnerDock width={640}>
      <Stack p={8} spacing={8}>
        <Heading size='lg'>{message('bundle.create')}</Heading>

        <Text>{message('bundle.createDescription')}</Text>

        <Alert status='info'>
          <AlertIcon />
          {message('bundle.notice')}
        </Alert>
      </Stack>

      <form ref={formRef} onSubmit={submit}>
        <Stack
          opacity={uploading ? 0.4 : 1}
          pointerEvents={uploading ? 'none' : 'auto'}
          pl={8}
          pr={8}
          spacing={8}
        >
          <FormControl isRequired>
            <FormLabel htmlFor='bundleName'>{message('bundle.name')}</FormLabel>
            <Input id='bundleName' name='bundleName' placeholder='Name' />
          </FormControl>

          <Skeleton isLoaded={dataIsLoaded}>
            <Tabs
              isFitted
              isLazy
              onChange={(i) => {
                if (i === 1) {
                  setReuseOsm(true)
                  osm.setFiles('')
                } else {
                  setReuseOsm(false)
                }
              }}
            >
              <TabList>
                <Tab>{message('bundle.osm.uploadNewTitle')}</Tab>
                <Tab
                  aria-disabled={!hasExistingBundles}
                  disabled={!hasExistingBundles}
                >
                  {message('bundle.osm.existingTitle')}
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <Stack spacing={4} pt={4}>
                    <Heading size='sm'>
                      {message('bundle.osmconvertDescription')}
                      <DocsLink
                        ml={1}
                        to='/prepare-inputs#preparing-the-osm-data'
                      />
                    </Heading>

                    <Code>
                      {message('bundle.osmConvertCommand', {
                        north: bounds.north,
                        south: bounds.south,
                        east: bounds.east,
                        west: bounds.west
                      })}
                    </Code>

                    <Heading size='sm'>
                      {message('bundle.osmosisDescription')}
                      <DocsLink
                        ml={1}
                        to='/prepare-inputs#preparing-the-osm-data'
                      />
                    </Heading>

                    <Code>
                      {message('bundle.osmosisCommand', {
                        north: bounds.north,
                        south: bounds.south,
                        east: bounds.east,
                        west: bounds.west
                      })}
                    </Code>

                    <FormControl isRequired>
                      <FormLabel htmlFor='osm'>
                        {message('bundle.osm.uploadNewLabel')}
                      </FormLabel>
                      <Input
                        accept='.pbf'
                        id='osm'
                        isRequired
                        name='osm'
                        type='file'
                        onChange={osm.onChangeFiles}
                        value={osm.value}
                      />
                      <FileSizeInputHelper />
                    </FormControl>
                  </Stack>
                </TabPanel>
                <TabPanel pt={4} px={0}>
                  <Select
                    id='osmId'
                    isRequired
                    name='osmId'
                    onChange={onChange('osmId')}
                    placeholder={message('bundle.osm.existingLabel')}
                  >
                    {bundles?.map((b) => (
                      <option key={b._id} value={b.osmId}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Skeleton>

          <Skeleton isLoaded={dataIsLoaded}>
            <Tabs
              isFitted
              isLazy
              onChange={(i) => {
                if (i === 1) {
                  setReuseGtfs(true)
                  feedGroup.setFiles('')
                } else {
                  setReuseGtfs(false)
                }
              }}
            >
              <TabList>
                <Tab>{message('bundle.gtfs.uploadNewTitle')}</Tab>
                <Tab
                  aria-disabled={!hasExistingBundles}
                  disabled={!hasExistingBundles}
                >
                  {message('bundle.gtfs.existingTitle')}
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel pt={4} px={0}>
                  <FormControl isRequired>
                    <FormLabel htmlFor='feedGroup'>
                      {message('bundle.gtfs.uploadNewLabel')}
                    </FormLabel>
                    <Input
                      accept='.zip'
                      id='feedGroup'
                      isRequired
                      multiple
                      name='feedGroup'
                      type='file'
                      onChange={feedGroup.onChangeFiles}
                      value={feedGroup.value}
                    />
                    <FileSizeInputHelper />
                  </FormControl>
                </TabPanel>
                <TabPanel pt={4} px={0}>
                  <Select
                    id='feedGroupId'
                    isRequired
                    name='feedGroupId'
                    onChange={onChange('feedGroupId')}
                    placeholder={message('bundle.gtfs.existingLabel')}
                  >
                    {bundles?.map((b) => (
                      <option key={b._id} value={b.feedGroupId}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Skeleton>

          <input type='hidden' name='regionId' value={regionId} />

          <Stack spacing={4}>
            <Button
              isDisabled={!isValid()}
              isLoading={uploading}
              loadingText={message('common.processing')}
              size='lg'
              type='submit'
              colorScheme='green'
            >
              {message('common.create')}
            </Button>
          </Stack>
        </Stack>
      </form>
    </InnerDock>
  )
}
