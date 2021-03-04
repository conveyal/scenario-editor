import mapValues from 'lodash/mapValues'
import {ObjectID} from 'mongodb'

export function serializeCollection(obj: unknown) {
  if (obj instanceof Date) return obj.toISOString()
  if (obj instanceof ObjectID) return obj.toString()
  if (Array.isArray(obj)) return obj.map(serializeCollection)
  if (typeof obj === 'object') return mapValues(obj, serializeCollection)
  return obj
}
