import {
  Badge,
  Box,
  Flex,
  Heading,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react'
import React, {useContext} from 'react'
import useSWR from 'swr'

import {API} from 'lib/constants'

import JobDashboard from 'lib/components/admin-job-dashboard'
import TextLink from 'lib/components/text-link'
import WorkerList from 'lib/components/admin-worker-list'
import {UserContext} from 'lib/user'
import withAuth from 'lib/with-auth'

// Refresh every five seconds
const refreshInterval = 5000

// Fetcher
const fetcher = (url, user) =>
  fetch(url, {
    headers: {
      Authorization: `bearer ${user.idToken}`,
      'X-Conveyal-Access-Group': user.adminTempAccessGroup
    }
  }).then((res) => res.json())

export default withAuth(function AdminDashboard() {
  const user = useContext(UserContext)
  const jobRequest = useSWR([API.Jobs, user], fetcher, {refreshInterval})
  const workerRequest = useSWR([API.Workers, user], fetcher, {refreshInterval})

  const jobs = (jobRequest.data || []).filter((j) => j.graphId !== 'SUM')
  const workers = workerRequest.data || []

  return (
    <Flex p={16}>
      <Stack spacing={4} mr={10}>
        <Heading>ADMIN</Heading>
        <TextLink href='/'>Regions</TextLink>
        <TextLink href='/admin/set-access-group'>Set access group</TextLink>
      </Stack>
      <Box flex='1'>
        <Tabs isFitted>
          <TabList>
            <Tab>
              Jobs{' '}
              <Badge ml='2' rounded='full'>
                {jobs.length}
              </Badge>
            </Tab>
            <Tab>
              Workers{' '}
              <Badge ml='2' rounded='full'>
                {workers.length}
              </Badge>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <JobDashboard jobs={jobs} workers={workers} />
            </TabPanel>
            <TabPanel>
              <WorkerList workers={workers} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  )
})
