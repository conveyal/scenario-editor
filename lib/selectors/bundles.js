import get from 'lodash/get'

export default function selectBundles(state) {
  return get(state, 'region.bundles', [])
}
