import {Box, Flex} from '@chakra-ui/core'
import dynamic from 'next/dynamic'
import React from 'react'

import Sidebar from '../components/sidebar'
import useRouteChanging from '../hooks/use-route-changing'
import withAuth from '../with-auth'
import withRedux from '../with-redux'

// Cannot be rendered server side
const LeafletContext = dynamic(() => import('../components/map/context'), {
  ssr: false
})
const Map = dynamic(() => import('../components/map'), {ssr: false})

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
    const [mapChildren, setMapChildren] = React.useState()
    const [leafletContext, setLeafletContext] = React.useState()

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
          borderRight='1px solid #ddd'
          bg='#fff'
          opacity={routeChanging ? 0.4 : 1}
          minWidth='321px'
        >
          <LeafletContext value={leafletContext}>
            <MapChildrenContext.Provider value={setMapChildren}>
              {p.children}
            </MapChildrenContext.Provider>
          </LeafletContext>
        </Box>
        <Box flexGrow='1' opacity={routeChanging ? 0.4 : 1} position='relative'>
          <Map setLeafletContext={setLeafletContext}>{mapChildren}</Map>
        </Box>
      </Flex>
    )
  })
)
