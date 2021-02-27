import {
  Divider,
  Flex,
  Heading,
  Image,
  List,
  ListItem,
  Stack
} from '@chakra-ui/react'
import React from 'react'
import useSWR from 'swr'

import {ALink, ExternalLink} from 'lib/components/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/version'

const fetcher = (url) => fetch(url).then((res) => res.json())
const swrOptions = {refreshInterval: 5000}

export default function Status() {
  const req = useSWR(API_URL, fetcher, swrOptions)

  const color = !req.data ? 'red.500' : 'green.500'
  const text = req.error ? 'ERROR' : req.data ? 'OK' : 'NOT FOUND'
  const data = req.error || req.data || {}

  return (
    <Flex justify='center' mt={40}>
      <Stack spacing={10} width='50rem'>
        <Flex justify='space-between'>
          <Heading size='2xl'>Status</Heading>
          <Image display='inline-block' size='45px' src='/logo.svg' />
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
          <List styleType='disc'>
            {Object.keys(data).map((k) => (
              <ListItem key={k}>
                {k}:&nbsp;<strong>{data[k]}</strong>
              </ListItem>
            ))}
          </List>
        </Stack>
      </Stack>
    </Flex>
  )
}
