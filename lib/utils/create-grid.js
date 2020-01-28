/**
 * Create a Grid from an ArrayBuffer retrieved from the server or S3. Binary
 * data that uses a common header format used across Conveyal libraries.
 */
export default function create(data) {
  const array = new Int32Array(data, 4 * 5)
  const header = new Int32Array(data)

  let min = Infinity
  let max = -Infinity

  for (let i = 0, prev = 0; i < array.length; i++) {
    array[i] = prev += array[i]
    if (prev < min) min = prev
    if (prev > max) max = prev
  }

  const width = header[3]
  const height = header[4]

  function contains(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height
  }

  // Return 0 for cells outside of the grid
  function getValue(x, y) {
    if (contains(x, y)) return array[y * width + x]
    return 0
  }

  // parse header
  return {
    zoom: header[0],
    west: header[1],
    north: header[2],
    width,
    height,
    data: array,
    min,
    max,
    contains,
    getValue
  }
}
