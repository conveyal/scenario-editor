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
  Stack
} from '@chakra-ui/react'
import {useState} from 'react'
import {useDispatch} from 'react-redux'

import {createResource} from 'lib/actions/resources'
import {ALink} from 'lib/components/link'
import {ChevronLeft} from 'lib/components/icons'
import InnerDock from 'lib/components/inner-dock'
import MapLayout from 'lib/layouts/map'
import msg from 'lib/message'

const EXTS = ['.geojson', '.json'] // later: csv, pbf, zip
const TYPES = ['Lines', 'Points', 'Polygons']

export default function UploadResource(p) {
  const dispatch = useDispatch<any>()
  const [status, setStatus] = useState<void | JSX.Element>()
  const [error, setError] = useState<void | string>()
  const [file, setFile] = useState<File>(null)
  const [name, setName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [type, setType] = useState(TYPES[0])

  async function upload() {
    setStatus(msg('resources.uploading'))
    setUploading(true)
    try {
      const resource = await dispatch(
        createResource({
          name,
          file,
          regionId: p.query.regionId,
          type
        })
      )
      setError()
      setName('')
      setStatus(
        <span>
          Finished uploading!{' '}
          <ALink
            to='resourceEdit'
            query={{regionId: resource.regionId, resourceId: resource._id}}
          >
            View resource.
          </ALink>
        </span>
      )
    } catch (e) {
      console.error(e)
      setStatus()
      setError(e.message)
      setUploading(false)
    }
  }

  return (
    <InnerDock>
      <Stack p={4} spacing={4}>
        <Heading size='md'>
          <ALink to='resources' query={p.query}>
            <ChevronLeft />
          </ALink>
          <span>{msg('resources.uploadAction')}</span>
        </Heading>
        <Box>{msg('resources.allowedFileTypes')}</Box>
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
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            onChange={(e) => setName(e.currentTarget.value)}
            value={name}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Select file</FormLabel>
          <Input
            accept={EXTS.join(',')}
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
          />
        </FormControl>
        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select onChange={(e) => setType(e.currentTarget.value)} value={type}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FormControl>
        <Button
          isDisabled={uploading || !file || !name}
          isLoading={uploading}
          onClick={upload}
          colorScheme='green'
        >
          {msg('resources.uploadAction')}
        </Button>
      </Stack>
    </InnerDock>
  )
}

UploadResource.Layout = MapLayout
