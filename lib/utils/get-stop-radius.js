// @flow
const MAX_RADIUS = 12
const MAX_ZOOM = 16
const MIN_RADIUS = 0.1
const MIN_ZOOM = 10

export default function getStopRadius (zoom: number = 12) {
  if (zoom >= MAX_ZOOM) return MAX_RADIUS
  if (zoom <= MIN_ZOOM) return MIN_RADIUS

  const zdiff = (zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)
  return (zdiff * (MAX_RADIUS - MIN_RADIUS)) + MIN_RADIUS
}
