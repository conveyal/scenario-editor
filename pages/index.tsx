import {Alert, Box, Button, Flex, Skeleton, Stack} from '@chakra-ui/core'
import {
  faExternalLinkAlt,
  faMap,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'
import {GetServerSideProps} from 'next'

import {getUser} from 'lib/auth0'
import Icon from 'lib/components/icon'
import ListGroupItem from 'lib/components/list-group-item'
import {ALink, ExternalLink} from 'lib/components/link'
import Logo from 'lib/components/logo'
import AuthenticatedCollection from 'lib/db/authenticated-collection'
import {serializeCollection} from 'lib/db/utils'
import {useRegions} from 'lib/hooks/use-collection'
import useRouteTo from 'lib/hooks/use-route-to'
import withAuth from 'lib/with-auth'
import {IUser} from 'lib/user'

const alertDate = 'October, 2020'
const alertText =
  'Apply decay functions to opportunities, better manage analysis presets, and visualize travel time to destinations.'

type SelectRegionPageProps = {
  regions: CL.Region[]
  user: IUser
}

export default withAuth(function SelectRegionPage(p: SelectRegionPageProps) {
  const {data: regions, response} = useRegions({
    initialData: p.regions,
    options: {
      sort: {name: 1}
    }
  })
  const {accessGroup, email} = p.user
  const goToRegionCreate = useRouteTo('regionCreate')

  return (
    <Flex
      alignItems='center'
      direction='column'
      py={10}
      zIndex={1} // Necessary for scrolling bug when Modals are closed (should be fixed in Chakra v1)
    >
      <Box mt={8} mb={6}>
        <Logo />
      </Box>
      <Stack spacing={4} textAlign='center' width='320px'>
        <Box>
          <span>signed in as </span>
          <strong>
            {email} ({accessGroup})
          </strong>
        </Box>
        <Alert status='success' borderRadius='md'>
          <Stack>
            <Box>
              <strong>{alertDate}</strong> — <span>{alertText} </span>{' '}
            </Box>
            <Box>
              <ALink to='changelog'>Click here to learn more.</ALink>
            </Box>
            <Box>
              <ExternalLink href='https://docs.conveyal.com'>
                Also, check out our improved User Manual{' '}
                <Icon icon={faExternalLinkAlt} />
              </ExternalLink>
            </Box>
          </Stack>
        </Alert>
        <Button
          isFullWidth
          leftIcon='small-add'
          onClick={goToRegionCreate}
          variantColor='green'
        >
          Set up a new region
        </Button>
        {!regions && response.isValidating && (
          <Skeleton id='LoadingSkeleton' height='30px' />
        )}
        {regions && regions.length > 0 && (
          <Box>or go to an existing region</Box>
        )}
        {regions && regions.length > 0 && (
          <Stack spacing={0}>
            {regions.map((region) => (
              <RegionItem key={region._id} region={region} />
            ))}
          </Stack>
        )}
        {process.env.NEXT_PUBLIC_AUTH_DISABLED !== 'true' && (
          <Box>
            <ALink to='logout'>
              <Icon icon={faSignOutAlt} /> Log out
            </ALink>
          </Box>
        )}
      </Stack>
    </Flex>
  )
})

interface RegionItemProps {
  region: CL.Region
}

function RegionItem({region, ...p}: RegionItemProps) {
  const goToRegion = useRouteTo('projects', {regionId: region._id})
  return (
    <ListGroupItem
      {...p}
      leftIcon={() => (
        <Box pr={3}>
          <Icon icon={faMap} />
        </Box>
      )}
      onClick={goToRegion}
    >
      {region.name}
    </ListGroupItem>
  )
}

/**
 * Take additional steps to attempt a fast page load since this is the first page most people will see.
 * Comment out to disable. Page load should still work.
 */
export const getServerSideProps: GetServerSideProps = async ({req}) => {
  let user: IUser = null
  try {
    user = await getUser(req)
  } catch (e) {
    return {
      unstable_redirect: {
        permanent: false,
        destination: '/api/login'
      }
    }
  }

  const collection = await AuthenticatedCollection.initFromUser('regions', user)
  const regions = await collection.findWhere({}, {sort: {name: 1}}).toArray()

  return {
    props: {
      regions: serializeCollection(regions),
      user
    }
  }
}
