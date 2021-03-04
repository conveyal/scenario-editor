import {withPageAuthRequired} from '@auth0/nextjs-auth0'
import {Alert, Box, Button, Flex, Skeleton, Stack} from '@chakra-ui/react'
import {GetServerSideProps} from 'next'
import Link from 'next/link'

import {getUser} from 'lib/auth0'
import {AddIcon, RegionIcon, SignOutIcon} from 'lib/components/icons'
import ListGroupItem from 'lib/components/list-group-item'
import {ALink} from 'lib/components/link'
import Logo from 'lib/components/logo'
import AuthenticatedCollection from 'lib/db/authenticated-collection'
import {serializeCollection} from 'lib/db/utils'
import {useRegions} from 'lib/hooks/use-collection'
import useLink from 'lib/hooks/use-link'
import useRouteTo from 'lib/hooks/use-route-to'
import withAuth from 'lib/with-auth'
import {IUser} from 'lib/user'

const alertDate = 'February, 2021'
const alertStatus = 'info'
const alertText = 'New options for spatial datasets'

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
  const logoutLink = useLink('logout')

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
      <Stack spacing={4} width='320px'>
        <Box textAlign='center'>
          <span>signed in as </span>
          <strong>
            {email} ({accessGroup})
          </strong>
        </Box>
        <Alert status={alertStatus} borderRadius='md'>
          <Stack>
            <Box>
              <strong>{alertDate}</strong> — <span>{alertText} </span>{' '}
            </Box>
            <Box textAlign='center'>
              <ALink to='changelog'>Click here to learn more.</ALink>
            </Box>
          </Stack>
        </Alert>
        <Button
          isFullWidth
          leftIcon={<AddIcon />}
          onClick={goToRegionCreate}
          colorScheme='green'
        >
          Set up a new region
        </Button>
        {!regions && response.isValidating && (
          <Skeleton id='LoadingSkeleton' height='30px' />
        )}
        {regions && regions.length > 0 && (
          <Box textAlign='center'>or go to an existing region</Box>
        )}
        {regions && regions.length > 0 && (
          <Stack spacing={0}>
            {regions.map((region) => (
              <RegionItem key={region._id} region={region} />
            ))}
          </Stack>
        )}
        {process.env.NEXT_PUBLIC_AUTH_DISABLED !== 'true' && (
          <Link href={logoutLink} passHref>
            <Button
              as='a'
              colorScheme='blue'
              leftIcon={<SignOutIcon />}
              variant='link'
            >
              Log out
            </Button>
          </Link>
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
    <ListGroupItem {...p} leftIcon={<RegionIcon />} onClick={goToRegion}>
      {region.name}
    </ListGroupItem>
  )
}

/**
 * Take additional steps to attempt a fast page load since this is the first page most people will see.
 * Comment out to disable. Page load should still work.
 */
export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
  getServerSideProps: async (ctx) => {
    const user = getUser(ctx.req, ctx.res)
    const collection = await AuthenticatedCollection.initFromUser(
      'regions',
      user
    )
    const regions = await collection.findWhere({}, {sort: {name: 1}}).toArray()

    return {
      props: {
        regions: serializeCollection(regions)
      }
    }
  }
})
