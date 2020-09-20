import dynamic from 'next/dynamic'
import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {loadBundle} from 'lib/actions'
import getFeedsRoutesAndStops from 'lib/actions/get-feeds-routes-and-stops'
import {
  saveToServer,
  setLocally,
  loadModification
} from 'lib/actions/modifications'
import {loadProject} from 'lib/actions/project'
import MapLayout from 'lib/layouts/map'
import selectModification from 'lib/selectors/active-modification'
import withInitialFetch from 'lib/with-initial-fetch'

// Lots of the ModificationEditor code depends on Leaflet. Load it all client side
const ModificationEditor = dynamic(
  () => import('lib/components/modification/editor'),
  {ssr: false}
)

const EditorPage = withInitialFetch(
  function Editor({query}) {
    const dispatch = useDispatch()
    const modification = useSelector(selectModification)
    const update = useCallback(
      (m) => {
        dispatch(saveToServer(m))
      },
      [dispatch]
    )
    const updateLocally = useCallback(
      (m) => {
        dispatch(setLocally(m))
      },
      [dispatch]
    )

    return (
      <ModificationEditor
        modification={modification}
        query={query}
        update={update}
        updateLocally={updateLocally}
      />
    )
  },
  async (dispatch, query) => {
    const {modificationId, projectId} = query

    // TODO check if project and feed are already loaded
    const [project, modification] = await Promise.all([
      dispatch(loadProject(projectId)),
      // Always reload the modification to get recent changes
      dispatch(loadModification(modificationId))
    ])

    // Only gets unloaded feeds for modifications that have them
    const [bundle, feeds] = await Promise.all([
      dispatch(loadBundle(project.bundleId)),
      dispatch(
        getFeedsRoutesAndStops({
          bundleId: project.bundleId,
          modifications: [modification]
        })
      )
    ])

    return {
      bundle,
      feeds,
      modification,
      project
    }
  }
)

EditorPage.Layout = MapLayout

export default EditorPage
