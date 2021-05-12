import {
  Divider,
  Flex,
  Heading,
  Image,
  List,
  ListItem,
  Stack
} from '@chakra-ui/react'
import useSWR from 'swr'

import {ALink, ExternalLink} from 'lib/components/link'
import {getJSON, ResponseError} from 'lib/utils/safe-fetch'

type Version = Record<string, string>

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/version'
async function fetcher(url: string) {
  const res = await getJSON<Version>(url)
  if (!res.ok) throw res
  return res.data
}

export default function Status() {
  const {data, error, isValidating} = useSWR<Version, ResponseError>(
    API_URL,
    fetcher,
    {refreshInterval: 5_000}
  )

  const color = error ? 'red.500' : isValidating ? 'blue.500' : 'green.500'
  const text = error ? error.problem : data ? 'OK' : 'WAITING'

  return (
    <Flex justify='center' mt={40}>
      <Stack spacing={10} width='50rem'>
        <Flex justify='space-between'>
          <Heading size='2xl'>Status</Heading>
          <Image display='inline-block' boxSize={45} src='/logo.svg' />
        </Flex>
        <ALink to='regions'>← Back to the application</ALink>
        <Divider />
        <Flex justify='space-between'>
          <Heading size='xl'>Front-end</Heading>
          <Heading color='green.500' size='xl'>
            OK
          </Heading>
        </Flex>
        <Divider />
        <Stack spacing={5}>
          <Flex justify='space-between'>
            <Heading size='xl'>Server</Heading>
            <Heading color={color} size='xl'>
              {text}
            </Heading>
          </Flex>
          <ExternalLink href={API_URL}>{API_URL}</ExternalLink>
          {error && <p>{error.error.message}</p>}
          {data && (
            <List styleType='disc'>
              {Object.keys(data).map((k) => (
                <ListItem key={k}>
                  {k}:&nbsp;<strong>{data[k]}</strong>
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </Stack>
    </Flex>
  )
}
