import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  useToast
} from '@chakra-ui/react'
import {FormEvent, useState} from 'react'
import {useDispatch} from 'react-redux'

import {ALink} from 'lib/components/link'
import {ChevronLeft} from 'lib/components/icons'
import InnerDock from 'lib/components/inner-dock'
import MapLayout from 'lib/layouts/map'
import useFileInput from 'lib/hooks/use-file-input'
import fetch from 'lib/actions/fetch'
import {API, SERVER_NGINX_MAX_CLIENT_BODY_SIZE} from 'lib/constants'
import useActivity from 'lib/hooks/use-activity'
import message from 'lib/message'

const EXTS = ['.geojson', '.json', '.shp', '.shx', '.prj', '.dbf', '.csv'] // later: pbf, zip
const TYPES = ['Lines', 'Points', 'Polygons']

export default function UploadResource(p) {
  const {response: activityResponse} = useActivity()
  const dispatch = useDispatch<any>()
  const error = useState<void | string>()
  const [name, setName] = useState('')
  const toast = useToast()
  const resource = useFileInput()
  const [uploading, setUploading] = useState(false)
  const [type, setType] = useState(TYPES[0])

  const isValid = () =>
    resource.totalSize < SERVER_NGINX_MAX_CLIENT_BODY_SIZE &&
    resource.files.length > 0

  async function submit(e: FormEvent<HTMLFormElement>) {
    // don't submit the form
    e.preventDefault()

    const formElement = e.currentTarget
    const body = new window.FormData(formElement)
    body.append('regionId', p.query.regionId)

    if (isValid()) {
      setUploading(true)

      try {
        await dispatch(
          fetch({
            url: API.Spatial,
            options: {body, method: 'post'}
          })
        )
        // Show the new activity
        await activityResponse.revalidate()
        // TODO redirect to spatial source page?
      } catch (e) {
        toast({
          title: 'Error uploading spatial dataset',
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
    <InnerDock>
      <Stack p={4} spacing={4}>
        <Heading size='md'>
          <ALink to='resources' query={p.query}>
            <ChevronLeft />
          </ALink>
          <span>{message('resources.uploadAction')}</span>
        </Heading>
        <Box>{message('resources.allowedFileTypes')}</Box>
        {error && (
          <Alert status='error'>
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {status && (
          <Alert status='info'>
            <AlertIcon />
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={submit}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              id='sourceName'
              name='sourceName'
              onChange={(e) => setName(e.currentTarget.value)}
              value={name}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Select file</FormLabel>
            <Input
              accept={EXTS.join(',')}
              id='sourceFiles'
              isRequired
              multiple
              name='sourceFiles'
              type='file'
              onChange={resource.onChangeFiles}
              value={resource.value}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type</FormLabel>
            <Select
              onChange={(e) => setType(e.currentTarget.value)}
              value={type}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormControl>

          <Button
            isDisabled={uploading || !name || !isValid()}
            isLoading={uploading}
            loadingText={message('common.uploading')}
            size='lg'
            type='submit'
            colorScheme='green'
          >
            {message('resources.uploadAction')}
          </Button>
        </form>
      </Stack>
    </InnerDock>
  )
}

UploadResource.Layout = MapLayout
