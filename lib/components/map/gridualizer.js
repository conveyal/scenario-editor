import {GridLayer, withLeaflet} from 'react-leaflet'

function createCreateTile(props) {
  return function createTile(coords) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    props.drawTile(canvas, coords, coords.z)
    return canvas
  }
}

export class GridualizerLayer extends GridLayer {
  createLeafletElement(props) {
    const gridLayer = super.createLeafletElement(props)
    gridLayer.createTile = createCreateTile(props)
    return gridLayer
  }
}

export default withLeaflet(GridualizerLayer)
