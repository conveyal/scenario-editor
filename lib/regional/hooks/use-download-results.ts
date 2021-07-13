import {useCallback} from 'react'

import useUser from 'lib/hooks/use-user'
import {API} from 'lib/constants'
import authFetch from 'lib/utils/auth-fetch'
import downloadObjectAsJson from 'lib/utils/download-json'

export function useDownloadCSVResults(analysisId: string) {
  const {user} = useUser()

  return useCallback(
    async (type: string) => {
      const url = `${API.Regional}/${analysisId}/csv/${type}`
      const res = await authFetch(url, user, (res) => res.text())
      if (res.ok === false) throw res.error
      window.open(res.data)
    },
    [analysisId, user]
  )
}

export function useDownloadRequestJSON(analysis: CL.RegionalAnalysis) {
  const {user} = useUser()
  return useCallback(async () => {
    const url = `${API.Regional}/${analysis._id}`
    const res = await authFetch(url, user)
    if (res.ok === false) throw res.error
    downloadObjectAsJson(res.data, analysis.name + '.json')
  }, [analysis, user])
}

/**
 * Perform an authenticated fetch to get a presigned URL to download a grid
 * from S3, then download it. Pass in the path to fetch.
 */
export function useDownloadProjectGIS(
  analysisVariant: CL.RegionalAnalysisVariant
) {
  const {user} = useUser()
  const url = `${API.Regional}/${analysisVariant.analysis._id}/grid/tiff?cutoff=${analysisVariant.cutoff}&percentile=${analysisVariant.percentile}&destinationPointSetId=${analysisVariant.pointSetId}`

  return useCallback(async () => {
    const res = await authFetch<{url: string}>(url, user)
    if (res.ok === false) throw res.error
    window.open(res.data.url)
  }, [url, user])
}
