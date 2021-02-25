import {
  MINIMUM_R5_VERSION,
  VERSION_PARSE_REGEX,
  OLD_VERSION_PARSE_REGEX
} from './constants'

/**
 * Convert an r5 version to a number for comparing
 * NB Assumes no major, minor, patch, or commit version exceeds 100
 */
export function versionToNumber(version?: string): number {
  const versionString = version || ''
  if (versionString.match(/\./g) && versionString.match(/\./g).length == 1) {
    const versionMatch = versionString.match(VERSION_PARSE_REGEX)
    if (versionMatch) {
      const [, major = '0', minor = '0', commit = '0'] = versionMatch

      return (
        parseInt(major) * 10000 + parseInt(minor) * 100 + parseInt(commit) / 100
      )
    }

    return 0
  } else {
    const versionMatch = versionString.match(OLD_VERSION_PARSE_REGEX)
    if (versionMatch) {
      const [
        ,
        major = '0',
        minor = '0',
        patch = '0',
        commit = '0'
      ] = versionMatch

      return (
        parseInt(major) * 10000 +
        parseInt(minor) * 100 +
        parseInt(patch) +
        parseInt(commit) / 100
      )
    }

    return 0
  }
}

/**
 * Check if the r5 version is older than a given minimum.
 */
export function workerVersionInRange(
  version: string,
  min: string = MINIMUM_R5_VERSION,
  max = 'v1000.0.0'
): boolean {
  const versionNumber = versionToNumber(version)
  return (
    versionNumber >= versionToNumber(min) &&
    versionNumber <= versionToNumber(max)
  )
}

/**
 * Check if the r5 version is a patch version or in a given range
 */
export function workerVersionTestOrInRange(
  version: string,
  min: string,
  max?: string
): boolean {
  const isTestVersion = (version || '').search(/-/g) !== -1
  return isTestVersion || workerVersionInRange(version, min, max)
}
