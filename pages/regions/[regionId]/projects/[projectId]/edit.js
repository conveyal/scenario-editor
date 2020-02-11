import {loadProject} from 'lib/actions/project'
import EditProject from 'lib/components/edit-project'
import withInitialFetch from 'lib/with-initial-fetch'

async function initialFetch(store, query) {
  return {project: await store.dispatch(loadProject(query.projectId))}
}

export default withInitialFetch(EditProject, initialFetch)
