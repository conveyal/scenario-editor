import {Alert, Box, Flex, Stack} from '@chakra-ui/core'
import {
  faMap,
  faPlus,
  faSignOutAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import {useSelector} from 'react-redux'

import message from 'lib/message'
import selectRegions from 'lib/selectors/regions'

import A from './a'
import {ButtonLink} from './buttons'
import Icon from './icon'
import {ALink} from './link'
import Logo from './logo'
import P from './p'

export default function SelectRegion() {
  const user = useSelector(s => s.user)
  const accessGroup = user.adminTempAccessGroup || user.accessGroup
  const regions = useSelector(selectRegions)

  return (
    <Flex alignItems='center' mb={6} direction='column'>
      <Box mt={8} mb={6}>
        <Logo />
      </Box>
      <Stack spacing={4} textAlign='center' width='320px'>
        <Box>
          signed in as
          <strong>
            {' '}
            {user.email} ({accessGroup})
          </strong>
        </Box>
        <Alert status='info' borderRadius='4px'>
          <span>
            <strong>February 10, 2020</strong> — We made some changes to the
            application. <A href='/changelog'>Click here to learn more.</A>
          </span>
        </Alert>
        <Box>
          <ButtonLink to='regionCreate' style='success' block>
            <Icon icon={faPlus} /> {message('region.createAction')}
          </ButtonLink>
        </Box>
        {regions.length > 0 && <Box>{message('region.goToExisting')}</Box>}
        {regions.length > 0 && (
          <Box className='list-group'>
            {regions.map(region => (
              <ALink
                className='list-group-item'
                key={region._id}
                regionId={region._id}
                to='projects'
              >
                {region.statusCode === 'DONE' ? (
                  <span>
                    <Icon icon={faMap} /> {region.name}
                  </span>
                ) : (
                  <>
                    <P>
                      <Icon icon={faSpinner} spin /> {region.name}
                    </P>
                    <em>{message(`region.statusCode.${region.statusCode}`)}</em>
                  </>
                )}
              </ALink>
            ))}
          </Box>
        )}
        <Box>
          <ALink to='logout'>
            <Icon icon={faSignOutAlt} /> {message('authentication.logOut')}
          </ALink>
        </Box>
      </Stack>
    </Flex>
  )
}
