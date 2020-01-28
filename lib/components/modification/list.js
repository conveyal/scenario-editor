import {
  faEyeSlash,
  faPencilAlt,
  faPlus,
  faUpload
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {createModification} from 'lib/actions/modifications'
import {LS_MOM} from 'lib/constants'
import message from 'lib/message'
import {routeTo} from 'lib/router'
import * as localStorage from 'lib/utils/local-storage'

import {Button} from '../buttons'
import Icon from '../icon'
import InnerDock from '../inner-dock'
import {Group, Input} from '../input'
import Link from '../link'
import ProjectTitle from '../project-title'
import Tip from '../tip'
import VariantEditor from '../variant-editor'

import CreateModification from './create'
import ModificationGroup from './group'
import ModificationGroupItem from './group-item'

const ModificationsMap = dynamic(
  () => import('lib/components/modifications-map/display-all'),
  {
    loading: () => null,
    ssr: false
  }
)

function filterModifications(filter, modifications) {
  const filterLcase = filter != null ? filter.toLowerCase() : ''
  const filteredModificationsByType = {}

  modifications
    .filter(
      m => filter === null || m.name.toLowerCase().indexOf(filterLcase) > -1
    )
    .forEach(m => {
      filteredModificationsByType[m.type] = [
        ...(filteredModificationsByType[m.type] || []),
        m
      ]
    })

  return filteredModificationsByType
}

function useProject(pid) {
  return useSelector(s => s.project.projects.find(p => p._id === pid))
}

export default function ModificationsList(p) {
  const dispatch = useDispatch()
  const router = useRouter()
  // Get the query data
  const {projectId} = router.query

  // Displayed modifications
  const [modificationsOnMap, setModificationsOnMap] = React.useState(() =>
    get(localStorage.getParsedItem(LS_MOM), projectId, [])
  )

  // Set and store modifications on map
  function setAndStoreMoM(newMoM) {
    setModificationsOnMap(newMoM)
    const mom = localStorage.getParsedItem(LS_MOM) || {}
    mom[projectId] = newMoM
    localStorage.stringifyAndSet(LS_MOM, mom)
  }

  // Retrieve the data from the store
  const modifications = useSelector(state => state.project.modifications)
  const project = useProject(projectId)
  const regionId = project.regionId

  const [filter, setFilter] = React.useState('')
  const [showCreate, setShowCreate] = React.useState(false)
  const [filteredModificationsByType, setFiltered] = React.useState({})

  // Update filtered modifications when the filter changes
  React.useEffect(() => {
    setFiltered(filterModifications(filter, modifications))
  }, [filter, modifications])

  // Show a variant's modifications on the map
  function showVariant(index) {
    setAndStoreMoM(
      modifications.filter(m => m.variants[index] === true).map(m => m._id)
    )
  }

  function create({name, type}) {
    return dispatch(
      createModification({
        feedId: get(p, 'feeds[0].id'), // default to the first feed
        name,
        projectId,
        type,
        variants: project.variants.map(() => true)
      })
    ).then(m => {
      const {href, as} = routeTo('modificationEdit', {
        regionId,
        projectId,
        modificationId: m._id
      })
      router.push(href, as)
    })
  }

  // Render into map
  const {setMapChildren} = p
  React.useEffect(() => {
    setMapChildren(() => <ModificationsMap />)
    return () => setMapChildren(<React.Fragment />)
  }, [modificationsOnMap, setMapChildren])

  return (
    <>
      <ProjectTitle project={project} />
      <div className='ApplicationDockTitle'>
        <div>
          <Icon icon={faPencilAlt} /> {message('modification.plural')}
        </div>
        <div>
          <Tip
            className='ShowOnMap fa-btn'
            tip='Hide all modifications from map display'
          >
            <a onClick={() => setAndStoreMoM([])}>
              <Icon icon={faEyeSlash} />
            </a>
          </Tip>
          <Tip tip={message('project.importModifications')}>
            <Link
              to='modificationImport'
              projectId={projectId}
              regionId={regionId}
            >
              <a>
                <Icon icon={faUpload} />
              </a>
            </Link>
          </Tip>
        </div>
      </div>
      <InnerDock className='block'>
        <VariantEditor showVariant={showVariant} variants={project.variants} />
        <Group>
          <Button block onClick={() => setShowCreate(true)} style='success'>
            <Icon icon={faPlus} />
            {message('modification.create')}
          </Button>
        </Group>

        <Group>
          <Input
            placeholder={message('modification.filter')}
            onChange={e => setFilter(e.target.value)}
            type='text'
            value={filter}
          />
        </Group>

        {Object.keys(filteredModificationsByType).map(type => {
          const ms = filteredModificationsByType[type]
          return (
            <ModificationGroup
              defaultExpanded={ms.length < 5}
              key={`modification-group-${type}`}
              type={type}
            >
              {ms.map(m => (
                <ModificationGroupItem
                  hideFromMap={() =>
                    setAndStoreMoM(
                      modificationsOnMap.filter(id => id !== m._id)
                    )
                  }
                  key={m._id}
                  modification={m}
                  onMap={modificationsOnMap.find(id => id === m._id)}
                  projectId={projectId}
                  regionId={regionId}
                  showOnMap={() =>
                    setAndStoreMoM(modificationsOnMap.concat(m._id))
                  }
                />
              ))}
            </ModificationGroup>
          )
        })}
      </InnerDock>

      {showCreate && (
        <CreateModification hide={() => setShowCreate(false)} create={create} />
      )}
    </>
  )
}
