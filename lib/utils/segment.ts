export function getSegmentCoordinates(
  segment: CL.ModificationSegment
): GeoJSON.Position[] {
  return segment.geometry.type === 'LineString'
    ? segment.geometry.coordinates
    : [segment.geometry.coordinates]
}
