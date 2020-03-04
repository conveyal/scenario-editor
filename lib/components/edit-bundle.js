import {faPlus, faSave, faTrash} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {deleteBundle, saveBundle} from 'lib/actions'
import message from 'lib/message'
import {routeTo} from 'lib/router'

import {Button} from './buttons'
import H5 from './h5'
import Icon from './icon'
import {Group, Text} from './input'
import P from './p'
import Select from './select'

const getOptionLabel = b =>
  `${b.name}${b.status === 'DONE' ? '' : `: ${b.status}`}`

/**
 * Edit bundle is keyed by the bundle ID and will be completely unmounted and
 * recreated when that changes.
 */
export default function EditBundle(p) {
  const dispatch = useDispatch()
  const router = useRouter()
  const bundles = useSelector(s => s.region.bundles)

  const {regionId} = router.query
  const [bundleId, setBundleId] = React.useState(router.query.bundleId)
  const originalBundle = bundles.find(b => b._id === bundleId)
  const [bundle, setBundle] = React.useState(originalBundle)

  // If this bundle has project's associated with it. Disable deletion.
  const disableDelete = p.bundleProjects.length > 0

  function _deleteBundle() {
    if (window.confirm(message('bundle.deleteConfirmation'))) {
      dispatch(deleteBundle(bundleId)).then(() => {
        const {as, href} = routeTo('bundles', {regionId})
        router.push(href, as)
      })
    }
  }

  function goToCreateBundle() {
    const {as, href} = routeTo('bundleCreate', {regionId})
    router.push(href, as)
  }

  function _saveBundle() {
    dispatch(saveBundle(bundle)).then(b => setBundle(b))
  }

  function selectBundle(result) {
    setBundleId(result._id)
    const {as, href} = routeTo('bundleEdit', {regionId, bundleId: result._id})
    router.push(href, as)
  }

  function setName(e) {
    if (e.target.value && e.target.value.length > 0) {
      setBundle({...bundle, name: `${e.target.value}`})
    }
  }

  function setFeedName(feedId, e) {
    if (bundle && e.target.value && e.target.value.length > 0) {
      setBundle({
        ...bundle,
        feeds: bundle.feeds.map(f => {
          if (f.feedId === feedId) {
            return {
              ...f,
              name: e.target.value
            }
          }
          return f
        })
      })
    }
  }

  return (
    <>
      <P>{message('bundle.explanation')}</P>

      <Group>
        <Button block onClick={goToCreateBundle} style='success'>
          <Icon icon={faPlus} /> Create a bundle
        </Button>
      </Group>

      <P className='text-center'>{message('bundle.select')}</P>

      <Group>
        <Select
          options={bundles}
          getOptionLabel={getOptionLabel}
          getOptionValue={b => b._id}
          onChange={selectBundle}
          value={bundles.find(b => b._id === bundleId)}
        />
      </Group>

      {bundle && bundleId === router.query.bundleId && (
        <>
          <H5>{message('bundle.edit')}</H5>

          {bundle.status === 'PROCESSING_GTFS' && (
            <div className='alert alert-warning'>
              {message('bundle.processing')}
            </div>
          )}

          {bundle.status === 'ERROR' && (
            <div className='alert alert-danger'>
              <P>{message('bundle.failure')}</P>
              <P>{bundle.errorCode}</P>
            </div>
          )}

          <Text
            label={message('bundle.name')}
            name='Name'
            onChange={setName}
            placeholder='Bundle name'
            value={bundle.name}
          />

          {bundle.feeds &&
            bundle.feeds.map((feed, index) => (
              <Text
                key={feed.feedId}
                label={`${message('bundle.feed')} #${index + 1}`}
                onChange={e => setFeedName(feed.feedId, e)}
                placeholder='Feed name'
                value={feed.name}
              />
            ))}

          <Button
            block
            disabled={bundle === originalBundle}
            onClick={_saveBundle}
            title={message('bundle.save')}
            style='success'
          >
            <Icon icon={faSave} /> {message('bundle.save')}
          </Button>

          {disableDelete ? (
            <>
              <br />
              <div className='alert alert-info'>
                {message('bundle.deleteDisabled', {
                  projects: p.bundleProjects.length
                })}
              </div>
            </>
          ) : (
            <Button block style='danger' onClick={_deleteBundle}>
              <Icon icon={faTrash} /> {message('bundle.delete')}
            </Button>
          )}
        </>
      )}
    </>
  )
}
