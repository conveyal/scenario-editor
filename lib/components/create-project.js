import {Heading} from '@chakra-ui/core'
import {
  faCheck,
  faExclamationCircle,
  faPlus
} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch} from 'react-redux'

import {create} from 'lib/actions/project'
import message from 'lib/message'
import {routeTo} from 'lib/router'

import {Button, ButtonLink} from './buttons'
import Icon from './icon'
import InnerDock from './inner-dock'
import {Group as FormGroup, Text} from './input'
import P from './p'
import Select from './select'

export function CreateProject(p) {
  const [bundleId, setBundleId] = React.useState(null)
  const [creating, setCreating] = React.useState(false)
  const [name, setName] = React.useState('')
  const {dispatch, router} = p
  const {regionId} = router.query

  const readyToCreate =
    name && name.length > 0 && bundleId && bundleId.length > 0

  function _create() {
    setCreating(true)
    dispatch(create({bundleId, name, regionId})).then((project) => {
      const {as, href} = routeTo('modifications', {
        regionId: project.regionId,
        projectId: project._id
      })
      router.push(href, as)
    })
  }

  return (
    <InnerDock className='block'>
      <Heading mb={4} size='md'>
        {message('project.createAction')}
      </Heading>
      <Text
        label={message('project.name')}
        name={message('common.name')}
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      {p.bundles.length > 0 ? (
        <FormGroup id='select-bundle' label={message('project.bundle')}>
          <Select
            inputId='select-bundle'
            getOptionLabel={(b) => b.name}
            getOptionValue={(b) => b._id}
            options={p.bundles.filter((b) => b.status === 'DONE')}
            onChange={(b) => setBundleId(b._id)}
            placeholder={message('project.selectBundle')}
            value={p.bundles.find((b) => b._id === bundleId)}
          />
        </FormGroup>
      ) : (
        <FormGroup>
          <P>{message('project.noBundles')}</P>
          <ButtonLink to='bundleCreate' {...router.query} block style='success'>
            <Icon icon={faPlus} /> {message('bundle.create')}
          </ButtonLink>
        </FormGroup>
      )}
      {!readyToCreate && (
        <P className='alert alert-danger'>
          <Icon icon={faExclamationCircle} />{' '}
          {message('project.createActionTooltip')}
        </P>
      )}
      <Button
        block
        disabled={!readyToCreate || creating}
        onClick={_create}
        style='success'
      >
        <Icon icon={faCheck} /> {message('common.create')}
      </Button>
    </InnerDock>
  )
}

export default React.memo(function ConnectedCreateProject(p) {
  const dispatch = useDispatch()
  const router = useRouter()

  return <CreateProject {...p} dispatch={dispatch} router={router} />
})
