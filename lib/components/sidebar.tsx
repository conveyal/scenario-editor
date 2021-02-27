import {Box, BoxProps, Flex} from '@chakra-ui/react'
import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import omit from 'lodash/omit'
import {useRouter} from 'next/router'
import {memo, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import {CB_DARK, CB_HEX, PageKey} from 'lib/constants'
import useRouteChanging from 'lib/hooks/use-route-changing'
import {routeTo} from 'lib/router'

import {CREATING_ID} from '../constants/region'
import message from '../message'
import selectOutstandingRequests from '../selectors/outstanding-requests'
import {UserContext} from '../user'

import {
  BundlesIcon,
  EditIcon,
  InfoIcon,
  LoadingIcon,
  ProjectsIcon,
  RegionsIcon,
  ResourcesIcon,
  RegionalAnalysisIcon,
  SinglePointAnalysisIcon,
  SignOutIcon,
  SpatialDatasetsIcon,
  WifiIcon
} from './icons'
import SVGLogo from './logo.svg'
import Tip from './tip'
import useRouteTo from 'lib/hooks/use-route-to'

const sidebarWidth = '40px'

const NavItemContents = memo<BoxProps>(({children, ...p}) => {
  return (
    <Box
      borderBottom='2px solid rgba(0, 0, 0, 0)'
      cursor='pointer'
      color={CB_HEX}
      display='flex'
      fontSize='14px'
      lineHeight='20px'
      py={3}
      textAlign='center'
      width={sidebarWidth}
      _focus={{
        outline: 'none'
      }}
      _hover={{
        color: CB_DARK
      }}
      {...p}
    >
      <Box mx='auto'>{children}</Box>
    </Box>
  )
})

function useIsActive(to: PageKey, params = {}) {
  const [, pathname] = useRouteChanging()
  const route = routeTo(to, params)
  route.href = route.href.split('?')[0]
  route.as = route.as.split('?')[0]
  const pathOnly = pathname.split('?')[0]
  // Server === 'href', client === 'as'
  return pathOnly === route.href || pathOnly === route.as
}

type ItemLinkProps = {
  children: React.ReactNode
  label: string
  to: PageKey
  params?: any
}

/**
 * Render an ItemLink.
 */
const ItemLink = memo<ItemLinkProps>(({children, label, to, params = {}}) => {
  const isActive = useIsActive(to, params)
  const goToLink = useRouteTo(to, params)

  const navItemProps = isActive
    ? {
        bg: '#fff',
        borderBottom: `2px solid ${CB_HEX}`
      }
    : {onClick: () => goToLink()}

  return (
    <Tip isDisabled={isActive} label={label} placement='right'>
      <Box role='button' title={label}>
        <NavItemContents {...navItemProps}>{children}</NavItemContents>
      </Box>
    </Tip>
  )
})

// Selector for getting the queryString out of the store
const selectQueryString = fpGet('queryString')

export default function Sidebar() {
  const router = useRouter()
  const user = useContext(UserContext)
  const email = get(user, 'email')
  const storeParams = useSelector(selectQueryString)
  const queryParams = {...router.query, ...storeParams}
  const regionOnly = {regionId: queryParams.regionId}

  return (
    <Flex
      bg='#ddd'
      direction='column'
      height='100vh'
      id='sidebar'
      justify='space-between'
      width={sidebarWidth}
      zIndex={1} // Necessary for scrolling bug when Modals are closed (should be fixed in Chakra v1)
    >
      <div>
        <NavItemContents fontSize='22px' py={12}>
          <LogoSpinner />
        </NavItemContents>

        <ItemLink label={message('nav.regions')} to='regions'>
          <RegionsIcon />
        </ItemLink>
        {queryParams.regionId && queryParams.regionId !== CREATING_ID && (
          <>
            <ItemLink
              label={message('nav.projects')}
              to='projects'
              params={regionOnly}
            >
              <ProjectsIcon />
            </ItemLink>
            <ItemLink
              label={message('nav.networkBundles')}
              to='bundles'
              params={regionOnly}
            >
              <BundlesIcon />
            </ItemLink>
            <ItemLink
              label={message('nav.opportunityDatasets')}
              to='opportunities'
              params={queryParams}
            >
              <SpatialDatasetsIcon />
            </ItemLink>
            <Box className='DEV'>
              <ItemLink
                label={message('nav.resources')}
                to='resources'
                params={queryParams}
              >
                <ResourcesIcon />
              </ItemLink>
            </Box>
            <ItemLink
              label={message('nav.editModifications')}
              to={queryParams.projectId ? 'modifications' : 'projectSelect'}
              params={queryParams}
            >
              <EditIcon />
            </ItemLink>
            <ItemLink
              label={message('nav.analyze')}
              to='analysis'
              params={omit(queryParams, 'modificationId')}
            >
              <SinglePointAnalysisIcon />
            </ItemLink>
            <ItemLink
              label='Regional Analyses'
              to='regionalAnalyses'
              params={queryParams}
            >
              <RegionalAnalysisIcon />
            </ItemLink>
          </>
        )}
      </div>

      <div>
        {email && (
          <ItemLink
            label={
              message('authentication.logOut') +
              ' - ' +
              message('authentication.username', {username: email})
            }
            to='logout'
          >
            <SignOutIcon />
          </ItemLink>
        )}
        <ExternalLink
          label={message('nav.help')}
          href='https://docs.conveyal.com'
        >
          <InfoIcon />
        </ExternalLink>
        <OnlineIndicator />
      </div>
    </Flex>
  )
}

const isServer = typeof window === 'undefined'
const fn = () => {}
const addListener = isServer ? fn : window.addEventListener
const removeListener = isServer ? fn : window.removeEventListener

// TODO remove Sidebar redux dependency
const LogoSpinner = memo(() => {
  const [routeChanging] = useRouteChanging()
  const outstandingRequests = useSelector(selectOutstandingRequests)

  // Handle outstanding requests
  useEffect(() => {
    if (outstandingRequests) {
      const onBeforeUnload = (e) => {
        const returnValue = (e.returnValue = message('nav.unfinishedRequests'))
        return returnValue
      }

      addListener('beforeunload', onBeforeUnload)

      return () => removeListener('beforeunload', onBeforeUnload)
    }
  }, [outstandingRequests])

  if (outstandingRequests || routeChanging) {
    return <LoadingIcon className='fa-spin' />
  }

  return (
    <Box boxSize='21px'>
      <SVGLogo />
    </Box>
  )
})

const isOnline = () => (isServer ? true : navigator.onLine)
const OnlineIndicator = memo(() => {
  const [online, setOnline] = useState(() => isOnline())

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    // TODO: Check to see if it can communicate with the backend, not just the
    // internet (for local development)
    addListener('online', onOnline)
    addListener('offline', onOffline)
    return () => {
      removeListener('online', onOnline)
      removeListener('offline', onOffline)
    }
  }, [setOnline])

  if (online) return null
  return (
    <Tip label={message('nav.notConnectedToInternet')}>
      <Box>
        <NavItemContents color='red.500'>
          <WifiIcon />
        </NavItemContents>
      </Box>
    </Tip>
  )
})

type ExternalLinkProps = {
  children: React.ReactNode
  href: string
  label: string
}

const ExternalLink = memo<ExternalLinkProps>(({children, href, label}) => {
  return (
    <Tip label={label} placement='right'>
      <Box>
        <a target='_blank' href={href} rel='noopener noreferrer'>
          <NavItemContents>{children}</NavItemContents>
        </a>
      </Box>
    </Tip>
  )
})
