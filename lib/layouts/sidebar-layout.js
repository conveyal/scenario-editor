import {Box, Flex} from '@chakra-ui/react'
import React from 'react'

import Sidebar from '../components/sidebar'
import useRouteChanging from '../hooks/use-route-changing'
import withAuth from '../with-auth'
import withRedux from '../with-redux'

export default withAuth(
  withRedux(function SidebarLayout(p) {
    const [routeChanging] = useRouteChanging()

    return (
      <Flex pointerEvents={routeChanging ? 'none' : 'inherit'}>
        <Sidebar />
        <Box opacity={routeChanging ? 0.4 : 1}>{p.children}</Box>
      </Flex>
    )
  })
)
