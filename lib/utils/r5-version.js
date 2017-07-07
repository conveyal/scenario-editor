// @flow
/** Utilities for working with r5 versions */

/** Determine if a particular version is a release version */
export const RELEASE_VERSION_REGEX = /^v[0-9]+\.[0-9]+\.[0-9]+$/

/** Parse a version into its constituent pieces (major, minor, patch, distance from last release, commit) */
const VERSION_PARSE_REGEX = /^v([0-9]+).([0-9]+).([0-9]+)-?([0-9]+)?-?(.*)?$/

/** Compare two R5 versions to determine which is more recent */
export function compareR5Versions (a: string, b: string): number {
  const aMatch = a.match(VERSION_PARSE_REGEX)
  const bMatch = b.match(VERSION_PARSE_REGEX)
  if (aMatch && bMatch) {
    const [, amajor, aminor, apatch, acommit] = aMatch
    const [, bmajor, bminor, bpatch, bcommit] = bMatch

    const intDiff = (a, b) => parseInt(a) - parseInt(b)

    const diffs = [intDiff(amajor, bmajor), intDiff(aminor, bminor), intDiff(apatch, bpatch)]
    for (const diff of diffs) {
      if (diff !== 0) return diff < 0 ? -1 : 1
    }

    // commit versions go above their release versions to keep chronology
    if (acommit == null && bcommit == null) return 0
    if (acommit == null) return -1
    if (bcommit == null) return 1

    const commitDiff = intDiff(acommit, bcommit)
    if (commitDiff < 0) return -1
    else if (commitDiff > 0) return 1
  }

  return 0 // this should not happen, no two versions should be identical
}
