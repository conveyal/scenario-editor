import {
  Box,
  BoxProps,
  Center,
  Flex,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'
import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import omit from 'lodash/omit'
import {useRouter} from 'next/router'
import {memo, useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'

import {CB_DARK, CB_HEX, PageKey} from 'lib/constants'
import {CREATING_ID} from 'lib/constants/region'
import useRouteChanging from 'lib/hooks/use-route-changing'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import {routeTo} from 'lib/router'
import selectOutstandingRequests from 'lib/selectors/outstanding-requests'
import {UserContext} from 'lib/user'

import {
  BundlesIcon,
  EditIcon,
  InfoIcon,
  LoadingIcon,
  MoonIcon,
  ProjectsIcon,
  RegionsIcon,
  ResourcesIcon,
  RegionalAnalysisIcon,
  SinglePointAnalysisIcon,
  SignOutIcon,
  SpatialDatasetsIcon,
  SunIcon
} from './icons'
import SVGLogo from './logo.svg'
import Tip from './tip'

const sidebarWidth = '40px'

const NavItemContents = memo<BoxProps>(({children, ...p}) => {
  return (
    <Center
      borderBottom='2px solid rgba(0, 0, 0, 0)'
      boxSize={sidebarWidth}
      cursor='pointer'
      color={CB_HEX}
      fontSize='14px'
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
    </Center>
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
  const bg = useColorModeValue('white', 'gray.900')

  const navItemProps = isActive
    ? {
        bg,
        borderBottom: `2px solid ${CB_HEX}`
      }
    : {onClick: () => goToLink()}

  return (
    <Tip isDisabled={isActive} label={label} placement='right'>
      <div>
        <NavItemContents {...navItemProps} role='button' title={label}>
          {children}
        </NavItemContents>
      </div>
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
  const bg = useColorModeValue('gray.200', 'gray.800')
  const colorMode = useColorMode()

  return (
    <Flex
      bg={bg}
      direction='column'
      height='100vh'
      id='sidebar'
      justify='space-between'
      width={sidebarWidth}
      zIndex={1} // Necessary for scrolling bug when Modals are closed (should be fixed in Chakra v1)
    >
      <div>
        <NavItemContents fontSize='22px' my={12}>
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
        <NavItemContents className='DEV' onClick={colorMode.toggleColorMode}>
          {colorMode.colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </NavItemContents>
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
    return <LoadingIcon className='fa-spin' id='sidebar-spinner' />
  }

  return (
    <Box boxSize='21px'>
      <SVGLogo />
    </Box>
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
      <div>
        <a target='_blank' href={href} rel='noopener noreferrer'>
          <NavItemContents>{children}</NavItemContents>
        </a>
      </div>
    </Tip>
  )
})
