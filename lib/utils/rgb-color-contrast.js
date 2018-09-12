// @flow

export function isLight (c: {b: number, g: number, r: number}) {
  const yiq = ((c.r * 299) + (c.g * 587) + (c.b * 114)) / 1000
  return yiq >= 128
}
