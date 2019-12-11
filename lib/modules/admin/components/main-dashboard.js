import {Box, Flex, Heading, PseudoBox, Stack} from '@chakra-ui/core'
import Router from 'next/router'
import React from 'react'

import {CB_HEX, CB_DARK} from 'lib/constants'

import JobDashboard from './job-dashboard'

function AdminLink({children, to, ...p}) {
  return (
    <PseudoBox
      color={CB_HEX}
      cursor='pointer'
      textDecoration='underline'
      _hover={{color: CB_DARK}}
      {...p}
      onClick={() => Router.push(to)}
    >
      {children}
    </PseudoBox>
  )
}

export default function MainDashboard() {
  return (
    <Flex p={16}>
      <Stack spacing={4} mr={10}>
        <Heading>ADMIN</Heading>
        <AdminLink to='/'>Regions</AdminLink>
        <AdminLink to='/admin/set-access-group'>Set access group</AdminLink>
      </Stack>
      <Box flex='1'>
        <JobDashboard />
      </Box>
    </Flex>
  )
}
