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
} from '@chakra-ui/core'
import React from 'react'

import JobDashboard from 'lib/components/admin-job-dashboard'
import TextLink from 'lib/components/text-link'
import WorkerList from 'lib/components/admin-worker-list'
import getInitialAuth from 'lib/get-initial-auth'
import {useProxyRequest} from 'lib/use-request'

// Refresh every five seconds
const refreshInterval = 5000

function AdminDashboard() {
  const jobRequest = useProxyRequest('/api/jobs', {refreshInterval})
  const workerRequest = useProxyRequest('/api/workers', {refreshInterval})

  const jobs = (jobRequest.data || []).filter(j => j.graphId !== 'SUM')
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
}

AdminDashboard.getInitialProps = getInitialAuth

export default AdminDashboard
