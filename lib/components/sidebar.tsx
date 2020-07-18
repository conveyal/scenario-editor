import {
  Box,
  Flex,
  Image,
  PseudoBox,
  PseudoBoxProps,
  useDisclosure
} from '@chakra-ui/core'
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
  faWifi,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import {useRouter} from 'next/router'
import {memo, useCallback, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import {CB_DARK, CB_HEX, LOGO_URL} from 'lib/constants'
import useRouteChanging from 'lib/hooks/use-route-changing'
import LogRocket from 'lib/logrocket'
import {routeTo} from 'lib/router'

import {CREATING_ID} from '../constants/region'
import message from '../message'
import selectOutstandingRequests from '../selectors/outstanding-requests'
import {UserContext} from '../user'

import Icon from './icon'

const sidebarWidth = '40px'

type NavTipProps = {label: string}

const NavTip = memo<NavTipProps>(({label}) => {
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
          <span className='tooltip-inner'>{label}</span>
        </Box>
      </Box>
    </Box>
  )
})

type NavItemContentsProps = {
  label: string
  isActive?: boolean
} & PseudoBoxProps

const NavItemContents = memo<NavItemContentsProps>(
  ({children, isActive, label, ...p}) => {
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
        {!isActive && isOpen && <NavTip label={label} />}
      </PseudoBox>
    )
  }
)

function useIsActive({to, params = {}}) {
  const [, pathname] = useRouteChanging()
  let {href, as} = routeTo(to, params)
  href = href.split('?')[0]
  as = as.split('?')[0]
  const pathOnly = pathname.split('?')[0]
  // Server === 'href', client === 'as'
  return pathOnly === href || pathOnly === as
}

type ItemLinkProps = {
  icon: IconDefinition
  label: string
  link: {
    to: string
    params?: any
  }
}

/**
 * Render an ItemLink.
 */
const ItemLink = memo<ItemLinkProps>(({icon, label, link}) => {
  const router = useRouter()
  const isActive = useIsActive(link)

  const goToLink = useCallback(() => {
    const {href, as, query} = routeTo(link.to, link.params)
    router.push({pathname: href, query}, as)
  }, [link, router])

  const navItemProps = isActive
    ? {
        bg: '#fff',
        borderBottom: `2px solid ${CB_HEX}`,
        boxShadow: '0 6px 6px 0 rgba(51, 122, 183, 0.1'
      }
    : {onClick: goToLink}

  return (
    <NavItemContents {...navItemProps} isActive={isActive} label={label}>
      <Icon icon={icon} title={label} />
    </NavItemContents>
  )
})

export default function Sidebar() {
  const router = useRouter()
  const user = useContext(UserContext)
  const email = get(user, 'email')
  const {projectId, regionId} = router.query

  return (
    <Flex
      bg='#ddd'
      direction='column'
      height='100vh'
      justify='space-between'
      width='40px'
    >
      <div>
        <Box fontSize='20px' py={10} textAlign='center' width='40px'>
          <LogoSpinner />
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
                params: {regionId}
              }}
            />
            <ItemLink
              icon={faCubes}
              label={message('nav.projects')}
              link={{
                to: 'projects',
                params: {regionId}
              }}
            />
            <ItemLink
              icon={faDatabase}
              label={message('nav.networkBundles')}
              link={{
                to: 'bundles',
                params: {regionId}
              }}
            />
            <ItemLink
              icon={faTh}
              label={message('nav.opportunityDatasets')}
              link={{
                to: 'opportunities',
                params: {regionId}
              }}
            />
            <Box className='DEV'>
              <ItemLink
                icon={faLayerGroup}
                label={message('nav.resources')}
                link={{
                  to: 'resources',
                  params: {regionId}
                }}
              />
            </Box>
            <ItemLink
              icon={faPencilAlt}
              label={message('nav.editModifications')}
              link={{
                to: projectId ? 'modifications' : 'projectSelect',
                params: {
                  regionId,
                  projectId: projectId ? projectId : 'undefined'
                }
              }}
            />
            <ItemLink
              icon={faChartArea}
              label={message('nav.analyze')}
              link={{
                to: 'analysis',
                params: {
                  projectId,
                  regionId
                }
              }}
            />
            <ItemLink
              icon={faServer}
              label='Regional Analyses'
              link={{
                to: 'regionalAnalyses',
                params: {
                  regionId
                }
              }}
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

  return <Image display='inline-block' size='20px' src={LOGO_URL} />
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
    <NavItemContents
      color='red.500'
      label={message('nav.notConnectedToInternet')}
    >
      <Icon icon={faWifi} />
    </NavItemContents>
  )
})

function ErrorTip() {
  const [error, setError] = useState()
  // Handle error events
  useEffect(() => {
    const onError = (e) => {
      LogRocket.captureException(e)
      setError(e.message)
    }
    const onUnhandledRejection = (e) => {
      LogRocket.captureException(e)
      setError(e.reason.stack)
    }

    addListener('error', onError)
    addListener('unhandledrejection', onUnhandledRejection)

    return () => {
      removeListener('error', onError)
      removeListener('unhandledrejection', onUnhandledRejection)
    }
  }, [setError])

  if (!error) return null
  return (
    <NavItemContents color='red.500' label={message('error.script') + error}>
      <Icon icon={faExclamationCircle} />
    </NavItemContents>
  )
}

type ExternalLinkProps = {
  href: string
  label: string
  icon: IconDefinition
}

const ExternalLink = memo<ExternalLinkProps>(({href, label, icon}) => {
  return (
    <a target='_blank' href={href} rel='noopener noreferrer'>
      <NavItemContents label={label}>
        <Icon icon={icon} />
      </NavItemContents>
    </a>
  )
})
