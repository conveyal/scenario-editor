import {Alert, Box, Button, Flex, Skeleton, Stack} from '@chakra-ui/core'
import {faMap, faSignOutAlt} from '@fortawesome/free-solid-svg-icons'
import {GetStaticProps} from 'next'
import Link from 'next/link'
import {useRouter} from 'next/router'

import Icon from 'lib/components/icon'
import ListGroupItem from 'lib/components/list-group-item'
import {ALink} from 'lib/components/link'
import Logo from 'lib/components/logo'
import {connectToDatabase} from 'lib/db/connect'
import {serializeCollection} from 'lib/db/utils'
import {useRegions} from 'lib/hooks/use-collection'
import {useFetchUser} from 'lib/user'
import LoadingScreen from 'lib/components/loading-screen'

const alertDate = 'December, 2020'
const alertStatus = 'warning'
const alertText = 'Minor changes and a few bug fixes related to modifications.'

type AccessGroupPageProps = {
  regions: CL.Region[]
}

export default function AccessGroupPage(p: AccessGroupPageProps) {
  const userFetch = useFetchUser()
  const {data: regions, response} = useRegions({
    initialData: p.regions,
    options: {
      sort: {name: 1}
    }
  })
  const router = useRouter()

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
        <Skeleton
          height='15px'
          isLoaded={userFetch.user && !userFetch.isValidating}
        >
          <Box>
            <span>signed in as </span>
            <strong>
              {userFetch.user?.email} ({userFetch.user?.accessGroup})
            </strong>
          </Box>
        </Skeleton>
        <Alert status={alertStatus} borderRadius='md'>
          <Stack>
            <Box>
              <strong>{alertDate}</strong> — <span>{alertText} </span>{' '}
            </Box>
            <Box color='blue.500'>
              <Link href='/changelog'>
                <a>Click here to learn more.</a>
              </Link>
            </Box>
          </Stack>
        </Alert>
        <Box>
          <Link href='/regions/create'>
            <Button isFullWidth leftIcon='small-add' variantColor='green'>
              Set up a new region
            </Button>
          </Link>
        </Box>
        {userFetch.isValidating ||
          (!regions && response.isValidating && (
            <Skeleton id='LoadingSkeleton' height='30px' />
          ))}
        {!userFetch.isValidating && regions && regions.length > 0 && (
          <Box>or go to an existing region</Box>
        )}
        {!userFetch.isValidating && regions && regions.length > 0 && (
          <Stack spacing={0}>
            {regions.map((region) => (
              <Link href={`/regions/${region._id}`} key={region._id}>
                <ListGroupItem
                  leftIcon={() => (
                    <Box pr={3}>
                      <Icon icon={faMap} />
                    </Box>
                  )}
                >
                  {region.name}
                </ListGroupItem>
              </Link>
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
      {
        projection: {
          _id: 1,
          name: 1
        },
        sort: {name: 1}
      }
    )
    .toArray()

  return {
    props: {
      regions: serializeCollection(regions)
    },
    revalidate: 1
  }
}
