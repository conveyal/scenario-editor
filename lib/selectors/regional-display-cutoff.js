import get from 'lodash/get'
export default state => parseInt(get(state, 'queryString.cutoff', 60))
