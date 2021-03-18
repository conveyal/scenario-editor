import mapValues from 'lodash/mapValues'
import {ObjectID} from 'mongodb'

export function serializeCollectionResults(obj: unknown) {
  if (obj instanceof Date) return obj.toISOString()
  if (obj instanceof ObjectID) return obj.toString()
  if (Array.isArray(obj)) return obj.map(serializeCollectionResults)
  if (typeof obj === 'object') return mapValues(obj, serializeCollectionResults)
  return obj
}
