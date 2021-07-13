import useCurrentProject from 'lib/hooks/use-current-project'
import {useBundle} from 'lib/hooks/use-model'

/**
 * Return the current bundle based on the selected project.
 */
export default function useCurrentBundle() {
  const project = useCurrentProject()
  const {data: bundle} = useBundle(project?._id)
  return bundle
}
