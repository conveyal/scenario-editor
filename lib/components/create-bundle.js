import {faCheck, faSpinner} from '@fortawesome/free-solid-svg-icons'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch} from 'react-redux'

import {addBundle} from 'lib/actions'
import fetch from 'lib/actions/fetch'
import {API} from 'lib/constants'
import message from 'lib/message'
import {routeTo} from 'lib/router'

import H5 from './h5'
import Icon from './icon'
import {File, Text} from './input'
import P from './p'

// how often to poll when waiting for a bundle to be read on the server.
const POLL_TIMEOUT_MS = 10000
const STATUS_DONE = 'DONE'
const STATUS_ERROR = 'ERROR'

/**
 * Create bundle form.
 */
export default function CreateBundle() {
  const dispatch = useDispatch()
  const router = useRouter()

  const [uploading, setUploading] = React.useState(false)
  const [uploadFailed, setUploadFailed] = React.useState(false)
  const [name, setName] = React.useState('')
  const [files, setFiles] = React.useState()

  const {regionId} = router.query

  /**
   * Check if the upload has completed
   */
  function checkUploadState(_id) {
    dispatch(fetch({url: `${API.Bundle}/${_id}`}))
      .then(bundle => {
        if (bundle.status === STATUS_DONE) {
          // Add bundle to the store
          dispatch(addBundle(bundle))

          // Go to bundle list
          const {href, as} = routeTo('bundles', {regionId})
          router.push(href, as)
        } else if (bundle.status === STATUS_ERROR) {
          setUploading(false)
          setUploadFailed(bundle.errorCode)
        } else {
          setTimeout(() => checkUploadState(_id), POLL_TIMEOUT_MS)
        }
      })
      .catch(() => {
        // this request failing does not imply that the bundle failed to upload
        setTimeout(() => checkUploadState(_id), POLL_TIMEOUT_MS)
      })
  }

  function submit(e) {
    // don't submit the form
    e.preventDefault()
    if (name && files) {
      setUploading(true)
      setUploadFailed(false)

      dispatch(
        fetch({
          url: API.Bundle,
          options: {
            body: new window.FormData(e.target),
            method: 'post'
          }
        })
      )
        .then(bundle => {
          setTimeout(() => checkUploadState(bundle._id), POLL_TIMEOUT_MS)
        })
        .catch(err => {
          setUploading(false)
          setUploadFailed(err)
        })
    }
  }

  return (
    <>
      <H5>{message('bundle.create')}</H5>
      <form encType='multipart/form-data' method='post' onSubmit={submit}>
        {uploading && (
          <div className='alert alert-warning'>
            {message('bundle.processing')}
          </div>
        )}
        {uploadFailed && (
          <div className='alert alert-danger'>
            <P>
              <strong>{message('bundle.failure')}</strong>
            </P>
            <P>{uploadFailed}</P>
          </div>
        )}
        <Text
          disabled={uploading}
          label={message('bundle.name')}
          name={message('common.name')}
          onChange={e => setName(e.target.value)}
          placeholder='Name'
        />

        <File
          disabled={uploading}
          label={message('bundle.files')}
          multiple
          name='files'
          onChange={e => setFiles(e.target.value)}
        />

        {name && files && !uploading && !uploadFailed && (
          <div className='alert alert-warning'>{message('bundle.notice')}</div>
        )}
        <input type='hidden' name='regionId' value={regionId} />
        <button
          className='btn btn-block btn-success'
          disabled={uploading || !name || !files}
          type='submit'
        >
          {uploading ? (
            <>
              <Icon icon={faSpinner} spin /> {message('common.processing')}
            </>
          ) : (
            <>
              <Icon icon={faCheck} /> {message('common.create')}
            </>
          )}
        </button>
      </form>
    </>
  )
}
