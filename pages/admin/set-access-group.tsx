import {Button, Flex, Input, Stack, Text} from '@chakra-ui/react'
import Cookie from 'js-cookie'
import {FormEvent, useState} from 'react'

import withAuth from 'lib/with-auth'

const key = 'adminTempAccessGroup'

interface FormElements extends HTMLFormControlsCollection {
  accessGroupInput: HTMLInputElement
}
interface AccessGroupFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

export default withAuth(function SetAccessGroup() {
  const [accessGroup, setAccessGroup] = useState(() => Cookie.get(key))

  function setGroup(e: FormEvent<AccessGroupFormElement>) {
    e.preventDefault()
    const newGroup = e.currentTarget.elements.accessGroupInput.value
    setAccessGroup(newGroup)
    Cookie.set(key, newGroup)
    // This reloads the page causing a new user session to be retrieved and the `adminTempAccessGroup` to be properly used.
    window.location.href = '/'
  }

  return (
    <form onSubmit={setGroup}>
      <Flex alignItems='center' direction='column'>
        <Stack width='300px' mt='10'>
          <Text>
            Current access group is: <strong>{accessGroup}</strong>
          </Text>
          <Input id='accessGroupInput' placeholder='Set access group' />
          <Button type='submit'>Set group and redirect to the home page</Button>
        </Stack>
      </Flex>
    </form>
  )
})
