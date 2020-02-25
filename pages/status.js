import {faArrowLeft, faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {
  Divider,
  Flex,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Stack
} from '@chakra-ui/core'
import React from 'react'

import Icon from 'lib/components/icon'
import useRequest from 'lib/hooks/use-request'

const API_URL = process.env.API_URL + '/version'

export default function Status() {
  const req = useRequest(API_URL, {
    refreshInterval: 5000
  })

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
        <Link
          color='blue.500'
          fontSize='14px'
          textDecoration='underline'
          href='/'
        >
          <Icon icon={faArrowLeft} /> Back to the application
        </Link>
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
          <Link
            color='blue.500'
            fontSize='14px'
            textDecoration='underline'
            href={API_URL}
          >
            {API_URL} <Icon icon={faExternalLinkAlt} />
          </Link>
          <List styleType='disc'>
            {Object.keys(data).map(k => (
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
