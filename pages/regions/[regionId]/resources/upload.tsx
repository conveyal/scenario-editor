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
import Link from 'next/link'
import {useState} from 'react'
import {useDispatch} from 'react-redux'

import {createResource} from 'lib/actions/resources'
import A from 'lib/components/a'
import {ChevronLeft} from 'lib/components/icons'
import InnerDock from 'lib/components/inner-dock'
import MapLayout from 'lib/layouts/map'
import msg from 'lib/message'
import {toHref} from 'lib/router'

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
      const href = toHref('resourceEdit', {
        regionId: resource.regionId,
        resourceId: resource._id
      })
      setStatus(
        <span>
          Finished uploading!{' '}
          <Link href={href} passHref>
            <A>View resource.</A>
          </Link>
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
          <Link href={toHref('resources', p.query)} passHref>
            <A>
              <ChevronLeft />
            </A>
          </Link>
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
