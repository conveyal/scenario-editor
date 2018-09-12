// @flow

export type Action =
  {payload: string[], type: 'r5Version/SET_ALL'}
| {payload: string, type: 'r5Version/SET_CURRENT'}
| {payload: void | string, type: 'r5Version/SET_LAST_ANALYSIS_VERSION'}

export type State = {
  +analysisVersion: void | string,
  +currentVersion: string,
  +versions: string[]
}
