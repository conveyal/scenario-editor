import {Box, Flex, Image, PseudoBox, useDisclosure} from '@chakra-ui/core'
import {
  faChartArea,
  faCompass,
  faCubes,
  faDatabase,
  faExclamationCircle,
  faGlobe,
  faLayerGroup,
  faMap,
  faPencilAlt,
  faQuestionCircle,
  faServer,
  faSignOutAlt,
  faTh,
  faWifi
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import {useRouter} from 'next/router'
import React from 'react'
import {useSelector} from 'react-redux'

import {CB_DARK, CB_HEX, LOGO_URL} from 'lib/constants'
import useRouteChanging from 'lib/hooks/use-route-changing'
import {routeTo} from 'lib/router'

import {CREATING_ID} from '../constants/region'
import message from '../message'
import selectOutstandingRequests from '../selectors/outstanding-requests'

import Icon from './icon'

const sidebarWidth = '40px'

function NavTip(p) {
  return (
    <Box pos='relative'>
      <Box pos='absolute' left={sidebarWidth} top='-20px'>
        <Box as='span' className='tooltip' px='5px' ml='3px'>
          <Box
            as='span'
            className='tooltip-arrow'
            borderRightColor='#333'
            borderWidth='5px 5px 5px 0'
            left='0'
            mt='-5px'
            top='50%'
          />
          <span className='tooltip-inner'>{p.label}</span>
        </Box>
      </Box>
    </Box>
  )
}

function NavItemContents({children, label, ...p}) {
  const {isOpen, onOpen, onClose} = useDisclosure()

  return (
    <PseudoBox
      borderBottom='2px solid rgba(0, 0, 0, 0)'
      cursor='pointer'
      color={CB_HEX}
      fontSize='14px'
      lineHeight='20px'
      onMouseOver={onOpen}
      onMouseOut={onClose}
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
      {isOpen && <NavTip label={label} />}
    </PseudoBox>
  )
}

export default function Sidebar() {
  const router = useRouter()
  const [routeChanging, pathname] = useRouteChanging()
  const username = useSelector(s => get(s, 'user.email'))
  const {projectId, regionId} = router.query

  /**
   * Render an ItemLink. Created internally to capture the pathname so it
   * doesn't need to be passed to each individually.
   */
  const ItemLink = React.useMemo(() => {
    function isActive({to, ...p}) {
      let {href, as} = routeTo(to, p)
      href = href.split('?')[0]
      as = as.split('?')[0]
      const pathOnly = pathname.split('?')[0]
      // Server === 'href', client === 'as'
      return pathOnly === href || pathOnly === as
    }

    return React.memo(function ItemLink(p) {
      function goToLink() {
        const {to, ...rest} = p.link
        const {href, as, query} = routeTo(to, rest)
        router.push({pathname: href, query}, as)
      }

      const navItemProps = isActive(p.link)
        ? {
            bg: '#fff',
            borderBottom: `2px solid ${CB_HEX}`,
            boxShadow: '0 6px 6px 0 rgba(51, 122, 183, 0.1'
          }
        : {onClick: goToLink}

      return (
        <NavItemContents {...navItemProps} label={p.label}>
          <Icon icon={p.icon} />
        </NavItemContents>
      )
    })
  }, [pathname, router])

  return (
    <Flex bg='#ddd' direction='column' justify='space-between' width='40px'>
      <div>
        <Box fontSize='20px' py={10} textAlign='center' width='40px'>
          <LogoSpinner routeChanging={routeChanging} />
        </Box>

        <ItemLink
          icon={faGlobe}
          label={message('nav.regions')}
          link={{to: 'regions'}}
        />
        {regionId && regionId !== CREATING_ID && (
          <>
            <ItemLink
              icon={faMap}
              label={message('nav.regionSettings')}
              link={{
                to: 'regionSettings',
                regionId
              }}
            />
            <ItemLink
              icon={faCubes}
              label={message('nav.projects')}
              link={{
                to: 'projects',
                regionId
              }}
            />
            <ItemLink
              icon={faDatabase}
              label={message('nav.gtfsBundles')}
              link={{
                to: 'bundles',
                regionId
              }}
            />
            <ItemLink
              icon={faTh}
              label={message('nav.opportunityDatasets')}
              link={{
                to: 'opportunities',
                regionId
              }}
            />
            <Box className='DEV'>
              <ItemLink
                icon={faLayerGroup}
                label={message('nav.resources')}
                link={{
                  to: 'resources',
                  regionId
                }}
              />
            </Box>
            <ItemLink
              icon={faPencilAlt}
              label={message('nav.editModifications')}
              link={{
                to: 'modifications',
                regionId,
                projectId: projectId ? projectId : 'undefined'
              }}
            />
            <ItemLink
              icon={faChartArea}
              label={message('nav.analyze')}
              link={{
                to: 'analysis',
                projectId,
                regionId
              }}
            />
            <ItemLink
              icon={faServer}
              label='Regional Analyses'
              link={{
                to: 'regionalAnalyses',
                regionId
              }}
            />
          </>
        )}
      </div>

      <div>
        {username && (
          <ItemLink
            icon={faSignOutAlt}
            label={
              message('authentication.logOut') +
              ' - ' +
              message('authentication.username', {username: username})
            }
            link={{to: 'logout'}}
          />
        )}
        <ExternalLink
          icon={faQuestionCircle}
          label={message('nav.help')}
          href='http://docs.analysis.conveyal.com/'
        />

        <ErrorTip />
        <OnlineIndicator />
      </div>
    </Flex>
  )
}

const isServer = typeof window === 'undefined'
const fn = () => {}
const addListener = isServer ? fn : window.addEventListener
const removeListener = isServer ? fn : window.removeEventListener

function LogoSpinner(p) {
  const outstandingRequests = useSelector(selectOutstandingRequests)

  // Handle outstanding requests
  React.useEffect(() => {
    if (outstandingRequests) {
      const onBeforeUnload = e => {
        const returnValue = (e.returnValue = message('nav.unfinishedRequests'))
        return returnValue
      }

      addListener('beforeunload', onBeforeUnload)

      return () => removeListener('beforeunload', onBeforeUnload)
    }
  }, [outstandingRequests])

  if (outstandingRequests || p.routeChanging) {
    return <Icon color={CB_HEX} icon={faCompass} spin />
  }

  return <Image display='inline-block' size='20px' src={LOGO_URL} />
}

const isOnline = () => (isServer ? true : navigator.onLine)
function OnlineIndicator() {
  const [online, setOnline] = React.useState(isOnline())

  React.useEffect(() => {
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
    <NavItemContents label={message('nav.notConnectedToInternet')}>
      <Icon icon={faWifi} />
    </NavItemContents>
  )
}

function ErrorTip() {
  const [error, setError] = React.useState()
  // Handle error events
  React.useEffect(() => {
    const onError = e => setError(e.message)
    const onUnhandledRejection = e => setError(e.reason.stack)

    addListener('error', onError)
    addListener('unhandledrejection', onUnhandledRejection)

    return () => {
      removeListener('error', onError)
      removeListener('unhandledrejection', onUnhandledRejection)
    }
  }, [setError])

  if (!error) return null
  return (
    <NavItemContents label={message('error.script') + error}>
      <Icon icon={faExclamationCircle} />
    </NavItemContents>
  )
}

function ExternalLink(p) {
  return (
    <a target='_blank' href={p.href} rel='noopener noreferrer'>
      <NavItemContents label={p.label}>
        <Icon icon={p.icon} />
      </NavItemContents>
    </a>
  )
}
