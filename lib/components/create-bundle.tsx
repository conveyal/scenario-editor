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
  Text
} from '@chakra-ui/react'
import {FormEvent, useRef, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import fetch from 'lib/actions/fetch'
import {API} from 'lib/constants'
import useTask from 'lib/hooks/use-task'
import message from 'lib/message'
import selectBundles from 'lib/selectors/bundles'
import selectCurrentRegion from 'lib/selectors/current-region'

import Code from './code'
import InnerDock from './inner-dock'
import Link from './link'
import DocsLink from './docs-link'
import TaskModal from './task-modal'

function ShowStatus({clear, regionId, taskId}) {
  const [task, clearTask] = useTask(taskId)

  if (!task) return null
  return (
    <TaskModal
      clear={() => {
        clearTask()
        clear()
      }}
      task={task}
    >
      <Link to='bundleEdit' query={{bundleId: task.tags.bundleId, regionId}}>
        <Button
          colorScheme='blue'
          onClick={() => clearTask()}
          isFullWidth
          mr={2}
          size='lg'
        >
          View the bundle
        </Button>
      </Link>
      <Link to='projectCreate' query={{regionId}}>
        <Button
          colorScheme='green'
          onClick={() => clearTask()}
          isFullWidth
          size='lg'
        >
          Create new project
        </Button>
      </Link>
    </TaskModal>
  )
}

/**
 * Create bundle form.
 */
export default function CreateBundle() {
  const dispatch = useDispatch<any>()
  const bundles = useSelector(selectBundles)
  const region = useSelector(selectCurrentRegion)
  const regionId = region._id
  const bounds = region.bounds
  const formRef = useRef<HTMLFormElement>()

  const hasExistingBundles = bundles.length > 0
  const [reuseOsm, setReuseOsm] = useState(hasExistingBundles)
  const [reuseGtfs, setReuseGtfs] = useState(hasExistingBundles)
  const [uploading, setUploading] = useState(false)
  const [task, setTask] = useState<CL.Task>(null)
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
    ((reuseOsm && formData.osmId) || (!reuseOsm && formData.osm)) &&
    ((reuseGtfs && formData.feedGroupId) || (!reuseGtfs && formData.feedGroup))

  async function submit(e: FormEvent<HTMLFormElement>) {
    // don't submit the form
    e.preventDefault()

    const body = new window.FormData(e.currentTarget)

    if (reuseGtfs) body.delete('feedGroup')
    else body.delete('feedGroupId')

    if (reuseOsm) body.delete('osm')
    else body.delete('osmId')

    if (isValid()) {
      setUploading(true)

      try {
        const task = await dispatch(
          fetch({
            url: API.Bundle,
            options: {body, method: 'post'}
          })
        )
        setTask(task)
      } catch (e) {
        setUploading(false)
      }
    }
  }

  return (
    <InnerDock width={640}>
      <Stack p={8} spacing={8}>
        <Heading size='lg'>{message('bundle.create')}</Heading>

        <Text>{message('bundle.createDescription')}</Text>

        {task && (
          <ShowStatus
            clear={() => {
              formRef.current.reset()
              setTask(null)
              setUploading(false)
            }}
            regionId={regionId}
            taskId={task.id}
          />
        )}

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
            onChange={(i) => setReuseOsm(i === 0)}
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
                        onChange={onChange('osm')}
                      />
                    </FormControl>
                  </Stack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Tabs
            defaultIndex={hasExistingBundles ? 0 : 1}
            isFitted
            onChange={(i) => setReuseGtfs(i === 0)}
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
                      onChange={onChange('feedGroup')}
                      type='file'
                    />
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
