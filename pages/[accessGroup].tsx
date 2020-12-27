import {Alert, Box, Button, Flex, Skeleton, Stack} from '@chakra-ui/core'
import {faMap, faSignOutAlt} from '@fortawesome/free-solid-svg-icons'
import {GetStaticProps} from 'next'
import {useRouter} from 'next/router'

import Icon from 'lib/components/icon'
import ListGroupItem from 'lib/components/list-group-item'
import {ALink} from 'lib/components/link'
import Logo from 'lib/components/logo'
import {connectToDatabase} from 'lib/db/connect'
import {serializeCollection} from 'lib/db/utils'
import {useRegions} from 'lib/hooks/use-collection'
import useRouteTo from 'lib/hooks/use-route-to'
import {useFetchUser} from 'lib/user'
import LoadingScreen from 'lib/components/loading-screen'

const alertDate = 'December, 2020'
const alertStatus = 'warning'
const alertText = 'Minor changes and a few bug fixes related to modifications.'

type AccessGroupPageProps = {
  regions: CL.Region[]
}

export default function AccessGroupPage(p: AccessGroupPageProps) {
  const {user, isValidating} = useFetchUser()
  const {data: regions, response} = useRegions({
    initialData: p.regions,
    options: {
      sort: {name: 1}
    }
  })
  const router = useRouter()
  const goToRegionCreate = useRouteTo('regionCreate')

  if (router.isFallback) return <LoadingScreen />

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
        <Skeleton height='15px' isLoaded={user && !isValidating}>
          <Box>
            <span>signed in as </span>
            <strong>
              {user?.email} ({user?.accessGroup})
            </strong>
          </Box>
        </Skeleton>
        <Alert status={alertStatus} borderRadius='md'>
          <Stack>
            <Box>
              <strong>{alertDate}</strong> — <span>{alertText} </span>{' '}
            </Box>
            <Box>
              <ALink to='changelog'>Click here to learn more.</ALink>
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
}

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
 * Get all of the access groups.
 */
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  }
}

/**
 * Take additional steps to attempt a fast page load since this is the first page most people will see.
 * Comment out to disable. Page load should still work.
 */
export const getStaticProps: GetStaticProps = async (context) => {
  const {db} = await connectToDatabase()
  const regions = await db
    .collection('regions')
    .find(
      {
        accessGroup: context.params.accessGroup
      },
      {sort: {name: 1}}
    )
    .toArray()

  return {
    props: {
      regions: serializeCollection(regions)
    },
    revalidate: 1
  }
}
