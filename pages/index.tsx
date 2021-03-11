import {Alert, Box, Button, Flex, Stack} from '@chakra-ui/react'
import Link from 'next/link'

import {AddIcon, RegionIcon, SignOutIcon} from 'lib/components/icons'
import ListGroupItem from 'lib/components/list-group-item'
import {ALink} from 'lib/components/link'
import Logo from 'lib/components/logo'
import {AUTH_DISABLED} from 'lib/constants'
import AuthenticatedCollection from 'lib/db/authenticated-collection'
import {useRegions} from 'lib/hooks/use-collection'
import useLink from 'lib/hooks/use-link'
import useRouteTo from 'lib/hooks/use-route-to'
import {getServerSidePropsWithAuth} from 'lib/with-auth'
import withDataLayout from 'lib/with-data-layout'
import useUser from 'lib/hooks/use-user'
import EmptyLayout from 'lib/layouts/empty'

const alertDate = 'February, 2021'
const alertStatus = 'info'
const alertText = 'New options for spatial datasets'

export default withDataLayout<{
  regions: CL.Region[]
}>(
  function SelectRegionPage({regions}) {
    const {accessGroup, email} = useUser()
    const goToRegionCreate = useRouteTo('regionCreate')
    const logoutLink = useLink('logout')
    const goToRegion = useRouteTo('projects')

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
          {!AUTH_DISABLED && (
            <Box textAlign='center'>
              <span>signed in as </span>
              <strong>
                {email} ({accessGroup})
              </strong>
            </Box>
          )}
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
          {regions.length > 0 && (
            <Stack spacing={4}>
              <Box textAlign='center'>or go to an existing region</Box>
              <Stack spacing={0}>
                {regions.map((region) => (
                  <ListGroupItem
                    key={region._id}
                    leftIcon={<RegionIcon />}
                    onClick={() => goToRegion({regionId: region._id})}
                  >
                    {region.name}
                  </ListGroupItem>
                ))}
              </Stack>
            </Stack>
          )}
          {!AUTH_DISABLED && (
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
  },
  function useData(p) {
    return {
      regions: useRegions({
        config: {
          initialData: p.regions
        },
        options: {sort: {name: 1}}
      })
    }
  },
  EmptyLayout
)

/**
 * Take additional steps to attempt a fast page load since this is the first page most people will see.
 * Comment out to disable. Page load should still work.
 */
export const getServerSideProps = getServerSidePropsWithAuth(
  async (_, user) => {
    const regions = await AuthenticatedCollection.with('regions', user)
    return {
      props: {
        regions: await regions.findJSON({}, {sort: {name: 1}})
      }
    }
  }
)
