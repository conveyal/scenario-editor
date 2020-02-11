import {faSave, faTrash} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch} from 'react-redux'

import {deleteProject, saveToServer} from 'lib/actions/project'
import message from 'lib/message'
import {routeTo} from 'lib/router'

import {Button} from './buttons'
import Icon from './icon'
import InnerDock from './inner-dock'
import {Group as FormGroup, Text} from './input'
import {ALink} from './link'
import P from './p'

export default function EditProject(p) {
  const dispatch = useDispatch()
  const router = useRouter()
  const [name, setName] = React.useState(p.project.name)

  function _deleteProject() {
    if (window.confirm(message('project.deleteConfirmation'))) {
      dispatch(deleteProject(p.project._id)).then(() => {
        const {as, href} = routeTo('projects', {
          regionId: p.project.regionId
        })
        router.push(href, as)
      })
    }
  }

  function _save() {
    dispatch(saveToServer({...p.project, name})).then(() => {
      const {as, href} = routeTo('modifications', {
        projectId: p.project._id,
        regionId: p.project.regionId
      })
      router.push(href, as)
    })
  }

  return (
    <InnerDock className='block'>
      <legend>{message('project.editSettings')}</legend>
      <Text
        label={message('project.name')}
        onChange={e => setName(e.target.value)}
        value={name}
      />
      <FormGroup label='Bundle'>
        <P>
          Bundle cannot be changed once a project is created.&nbsp;
          <ALink
            to='bundleEdit'
            bundleId={p.project.bundleId}
            regionId={p.project.regionId}
          >
            View bundle info here.
          </ALink>
        </P>
      </FormGroup>
      <Button
        disabled={!name || p.project.name === name}
        block
        onClick={_save}
        style='success'
      >
        <Icon icon={faSave} /> {message('project.editAction')}
      </Button>
      <Button block onClick={_deleteProject} style='danger'>
        <Icon icon={faTrash} /> {message('project.delete')}
      </Button>
    </InnerDock>
  )
}
