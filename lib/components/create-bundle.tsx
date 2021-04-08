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
  useToast
} from '@chakra-ui/react'
import {FormEvent, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import fetch from 'lib/actions/fetch'
import {API, SERVER_NGINX_MAX_CLIENT_BODY_SIZE} from 'lib/constants'
import useActivity from 'lib/hooks/use-activity'
import useFileInput from 'lib/hooks/use-file-input'
import message from 'lib/message'
import selectBundles from 'lib/selectors/bundles'
import selectCurrentRegion from 'lib/selectors/current-region'

import Code from './code'
import FileSizeInputHelper from './file-size-input-helper'
import InnerDock from './inner-dock'
import DocsLink from './docs-link'

/**
 * Create bundle form.
 */
export default function CreateBundle() {
  const {response} = useActivity()
  const {revalidate} = response
  const dispatch = useDispatch<any>()
  const bundles = useSelector(selectBundles)
  const region = useSelector(selectCurrentRegion)
  const toast = useToast()
  const regionId = region._id
  const bounds = region.bounds
  const formRef = useRef<HTMLFormElement>()

  const hasExistingBundles = bundles.length > 0
  const [reuseOsm, setReuseOsm] = useState(hasExistingBundles)
  const osm = useFileInput()
  const feedGroup = useFileInput()
  const [reuseGtfs, setReuseGtfs] = useState(hasExistingBundles)
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
    formData.name &&
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
        await revalidate()
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
        formElement.reset()
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
          <FormControl isRequired isInvalid={formData.name.length < 1}>
            <FormLabel htmlFor='bundleName'>{message('bundle.name')}</FormLabel>
            <Input
              id='bundleName'
              name='bundleName'
              onChange={onChange('name')}
              placeholder='Name'
            />
          </FormControl>

          <Tabs
            defaultIndex={hasExistingBundles ? 0 : 1}
            isFitted
            onChange={(i) => {
              if (i === 0) {
                setReuseOsm(true)
                osm.setFiles(null)
              } else {
                setReuseOsm(false)
              }
            }}
          >
            <TabList>
              <Tab
                aria-disabled={!hasExistingBundles}
                disabled={!hasExistingBundles}
              >
                {message('bundle.osm.existingTitle')}
              </Tab>
              <Tab>{message('bundle.osm.uploadNewTitle')}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel pt={4} px={0}>
                {reuseOsm && (
                  <Select
                    id='osmId'
                    name='osmId'
                    onChange={onChange('osmId')}
                    placeholder={message('bundle.osm.existingLabel')}
                  >
                    {bundles.map((b) => (
                      <option key={b._id} value={b.osmId}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                )}
              </TabPanel>
              <TabPanel p={0}>
                {!reuseOsm && (
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
                        name='osm'
                        type='file'
                        onChange={osm.onChangeFiles}
                        value={osm.value}
                      />
                      <FileSizeInputHelper />
                    </FormControl>
                  </Stack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Tabs
            defaultIndex={hasExistingBundles ? 0 : 1}
            isFitted
            onChange={(i) => {
              if (i === 0) {
                setReuseGtfs(true)
                feedGroup.setFiles(null)
              } else {
                setReuseGtfs(false)
              }
            }}
          >
            <TabList>
              <Tab
                aria-disabled={!hasExistingBundles}
                disabled={!hasExistingBundles}
              >
                {message('bundle.gtfs.existingTitle')}
              </Tab>
              <Tab>{message('bundle.gtfs.uploadNewTitle')}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel pt={4} px={0}>
                {reuseGtfs && (
                  <Select
                    id='feedGroupId'
                    name='feedGroupId'
                    onChange={onChange('feedGroupId')}
                    placeholder={message('bundle.gtfs.existingLabel')}
                  >
                    {bundles.map((b) => (
                      <option key={b._id} value={b.feedGroupId}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                )}
              </TabPanel>
              <TabPanel pt={4} px={0}>
                {!reuseGtfs && (
                  <FormControl isRequired>
                    <FormLabel htmlFor='feedGroup'>
                      {message('bundle.gtfs.uploadNewLabel')}
                    </FormLabel>
                    <Input
                      accept='.zip'
                      id='feedGroup'
                      multiple
                      name='feedGroup'
                      type='file'
                      onChange={feedGroup.onChangeFiles}
                      value={feedGroup.value}
                    />
                    <FileSizeInputHelper />
                  </FormControl>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>

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
