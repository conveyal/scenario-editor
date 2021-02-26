import {Box, Flex, PseudoBox, PseudoBoxProps} from '@chakra-ui/core'
import {
  faChartArea,
  faCompass,
  faCubes,
  faDatabase,
  faGlobe,
  faInfoCircle,
  faLayerGroup,
  faPencilAlt,
  faServer,
  faSignOutAlt,
  faTh,
  faWifi,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import omit from 'lodash/omit'
import Image from 'next/image'
import {useRouter} from 'next/router'
import {memo, useCallback, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import {CB_DARK, CB_HEX, LOGO_URL} from 'lib/constants'
import useRouteChanging from 'lib/hooks/use-route-changing'
import {routeTo} from 'lib/router'

import {CREATING_ID} from '../constants/region'
import message from '../message'
import selectOutstandingRequests from '../selectors/outstanding-requests'
import {UserContext} from '../user'

import Icon from './icon'
import Tip from './tip'

const sidebarWidth = '40px'

const NavItemContents = memo<PseudoBoxProps>(({children, ...p}) => {
  return (
    <PseudoBox
      borderBottom='2px solid rgba(0, 0, 0, 0)'
      cursor='pointer'
      color={CB_HEX}
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
      {children}
    </PseudoBox>
  )
})

function useIsActive(to: string, params = {}) {
  const [, pathname] = useRouteChanging()
  const route = routeTo(to, params)
  route.href = route.href.split('?')[0]
  route.as = route.as.split('?')[0]
  const pathOnly = pathname.split('?')[0]
  // Server === 'href', client === 'as'
  return pathOnly === route.href || pathOnly === route.as
}

type ItemLinkProps = {
  icon: IconDefinition
  label: string
  to: string
  params?: any
}

/**
 * Render an ItemLink.
 */
const ItemLink = memo<ItemLinkProps>(({icon, label, to, params = {}}) => {
  const router = useRouter()
  const isActive = useIsActive(to, params)

  const goToLink = useCallback(() => {
    const {href, as, query} = routeTo(to, params)
    router.push({pathname: href, query}, as)
  }, [params, router, to])

  const navItemProps = isActive
    ? {
        bg: '#fff',
        borderBottom: `2px solid ${CB_HEX}`,
        boxShadow: '0 6px 6px 0 rgba(51, 122, 183, 0.1'
      }
    : {onClick: goToLink}

  return (
    <Tip isDisabled={isActive} label={label}>
      <Box role='button' title={label}>
        <NavItemContents {...navItemProps}>
          <Icon icon={icon} title={label} />
        </NavItemContents>
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
      width='40px'
      zIndex={1} // Necessary for scrolling bug when Modals are closed (should be fixed in Chakra v1)
    >
      <div>
        <Box fontSize='20px' py={10} textAlign='center' width='40px'>
          <LogoSpinner />
        </Box>

        <ItemLink icon={faGlobe} label={message('nav.regions')} to='regions' />
        {queryParams.regionId && queryParams.regionId !== CREATING_ID && (
          <>
            <ItemLink
              icon={faCubes}
              label={message('nav.projects')}
              to='projects'
              params={regionOnly}
            />
            <ItemLink
              icon={faDatabase}
              label={message('nav.networkBundles')}
              to='bundles'
              params={regionOnly}
            />
            <ItemLink
              icon={faTh}
              label={message('nav.opportunityDatasets')}
              to='opportunities'
              params={queryParams}
            />
            <Box className='DEV'>
              <ItemLink
                icon={faLayerGroup}
                label={message('nav.resources')}
                to='resources'
                params={queryParams}
              />
            </Box>
            <ItemLink
              icon={faPencilAlt}
              label={message('nav.editModifications')}
              to={queryParams.projectId ? 'modifications' : 'projectSelect'}
              params={queryParams}
            />
            <ItemLink
              icon={faChartArea}
              label={message('nav.analyze')}
              to='analysis'
              params={omit(queryParams, 'modificationId')}
            />
            <ItemLink
              icon={faServer}
              label='Regional Analyses'
              to='regionalAnalyses'
              params={queryParams}
            />
          </>
        )}
      </div>

      <div>
        {email && (
          <ItemLink
            icon={faSignOutAlt}
            label={
              message('authentication.logOut') +
              ' - ' +
              message('authentication.username', {username: email})
            }
            to='logout'
          />
        )}
        <ExternalLink
          icon={faInfoCircle}
          label={message('nav.help')}
          href='https://docs.conveyal.com'
        />
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
    return <Icon color={CB_HEX} icon={faCompass} spin id='sidebar-spinner' />
  }

  return <Image priority height='20px' width='20px' src={LOGO_URL} />
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
          <Icon icon={faWifi} />
        </NavItemContents>
      </Box>
    </Tip>
  )
})

type ExternalLinkProps = {
  href: string
  label: string
  icon: IconDefinition
}

const ExternalLink = memo<ExternalLinkProps>(({href, label, icon}) => {
  return (
    <Tip label={label} placement='right'>
      <Box>
        <a target='_blank' href={href} rel='noopener noreferrer'>
          <NavItemContents>
            <Icon icon={icon} />
          </NavItemContents>
        </a>
      </Box>
    </Tip>
  )
})
