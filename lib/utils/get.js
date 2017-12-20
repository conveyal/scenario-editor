// @flow
import get from 'lodash/get'

/**
 * This is different than `lodash/get` in that it returns the default value if
 * the resolved value is `undefined` OR `null`. `lodash/get` only returns the
 * default value if it is `undefined`.
 *
 * @param {Object} o, the object to lookup values on
 * @param {string} p, the path to the value on the Object
 * @param {any} d, default value to return
 * @returns {any}
 */
export default function (o: any, p: string, d: any) {
  const value = get(o, p, d)
  return value === null ? d : value
}
