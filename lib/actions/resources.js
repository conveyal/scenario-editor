import {createAction} from 'redux-actions'

import {API} from 'lib/constants'

import fetch from './fetch'

export const setResource = createAction('set resource')
export const setResources = createAction('set resources')

export const createResource =
  ({file, name, regionId, type}) =>
  async (dispatch) => {
    const resource = await dispatch(
      fetch({
        url: API.Resources,
        options: {
          body: {
            name,
            regionId,
            filename: file.name,
            size: file.size,
            type,
            contentType: file.type
          },
          method: 'post'
        }
      })
    )

    const url = `${API.Resources}/${resource._id}/upload`
    if (resource.offline) {
      return dispatch(
        fetch({
          url,
          options: {
            body: file,
            method: 'post'
          }
        })
      )
    } else {
      // get the S3 upload URL
      const uploadUrl = await dispatch(fetch({url}))
      await dispatch(
        fetch({
          url: uploadUrl,
          options: {
            body: file,
            headers: {
              Authorization: null
            },
            // Required by S3
            // https://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObjectJavaSDK.html
            method: 'put'
          }
        })
      )

      // Update the resource with it's URL and a ready status
      return dispatch(
        fetch({
          url: `${API.Resources}/${resource._id}`,
          options: {
            body: {
              ...resource,
              status: 'ready'
            },
            method: 'put'
          }
        })
      )
    }
  }

export const toAggregationArea = ({resource, nameProperty, zoom}) =>
  
  fetch({
    url: `${API.Region}/${resource.regionId}/aggregationArea/${resource._id}?nameProperty=${nameProperty}&zoom=${zoom}`,
    options: {
      method: 'post'
    }
  })

export const deleteResource = (resource) =>
  fetch({
    url: `${API.Spatial}/source/${resource._id}`,
    options: {
      method: 'delete'
    },
    next: () => ({type: 'delete resource', payload: resource})
  })

export const loadResourceData = (resource) => (dispatch) =>
  dispatch(downloadResource(resource)).then((value) => {
    if (resource.offline) return value

    return dispatch(
      fetch({
        url: value,
        options: {
          headers: {
            Authorization: null
          }
        }
      })
    )
  })

export const downloadResource = (resource) =>
  fetch({
    url: `${API.Resources}/${resource._id}/download`
  })

export const loadResource = (resourceId) =>
  fetch({
    url: `${API.Spatial}/${resourceId}`
  })

export const loadAllResources = (query) =>
  fetch({
    url: `${API.Spatial}/region/${query.regionId}`,
    next: (r) => ({type: 'set resources', payload: r.value})
  })

export const updateResource = (resource) =>
  fetch({
    url: `${API.Resources}/${resource._id}`,
    options: {
      body: resource,
      method: 'put'
    }
  })
