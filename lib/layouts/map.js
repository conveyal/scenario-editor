import {Box, Flex, useColorModeValue} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import React from 'react'

import FullSpinner from 'lib/components/full-spinner'
import Sidebar from 'lib/components/sidebar'
import useRouteChanging from 'lib/hooks/use-route-changing'
import withAuth from 'lib/with-auth'
import withRedux from 'lib/with-redux'

// Cannot be rendered server side
const LeafletContext = dynamic(() => import('lib/components/map/context'), {
  ssr: false
})
const Map = dynamic(() => import('lib/components/map'), {ssr: false})

// Created to prevent prop drilling `setMapChildren`
export const MapChildrenContext = React.createContext(() => {})

/**
 * Components are rendered this way so that the map does not get unmounted
 * and remounted on each page change. There is probably a better way to do this
 * but I have not figured out a better solution yet.
 */
export default withAuth(
  withRedux(function MapLayout(p) {
    const [routeChanging] = useRouteChanging()
    const [leafletContext, setLeafletContext] = React.useState(null)
    const bg = useColorModeValue('white', 'gray.900')

    return (
      <Flex pointerEvents={routeChanging ? 'none' : 'inherit'}>
        <style jsx global>{`
          body {
            height: 100vh;
            overflow: hidden;
            width: 100vw;
          }
        `}</style>
        <Sidebar />
        <Box
          bg={bg}
          borderRightWidth='1px'
          opacity={routeChanging ? 0.4 : 1}
          minWidth='321px'
        >
          {leafletContext ? (
            <LeafletContext value={leafletContext}>{p.children}</LeafletContext>
          ) : (
            <FullSpinner />
          )}
        </Box>
        <Box flexGrow='1' opacity={routeChanging ? 0.4 : 1} position='relative'>
          <Map setLeafletContext={setLeafletContext} />
        </Box>
      </Flex>
    )
  })
)
