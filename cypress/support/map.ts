const getMapDiv = () => cy.get('div.leaflet-container', {log: false})
const getMap = (): Cypress.Chainable<L.Map> =>
  cy.window({log: false}).its('LeafletMap', {log: false})

// Reusable command for getting the map container
Cypress.Commands.add('getMapDiv', getMapDiv)
Cypress.Commands.add('getLeafletMap', getMap)

const waitDuration = 100
const minZoom = 12
const mapZoomComplete = () =>
  cy.get('.leaflet-zoom-anim', {log: false}).should('not.exist')
const wait = () => cy.wait(waitDuration, {log: false}) // eslint-disable-line

type WithMapFn = (map: L.Map) => any
function withMap(fn: WithMapFn) {
  cy.waitForMapToLoad().then((map) => {
    map.invalidateSize(false)
    wait()
    mapZoomComplete()

    cy.wrap(map, {log: false}).then(fn)

    map.invalidateSize(false)
    wait()
    mapZoomComplete()
  })
}

Cypress.Commands.add('clickMapAtCoord', (coord: L.LatLngTuple, zoom = 18) => {
  if (zoom < minZoom)
    throw new Error(`Minimum clickMapAtCoord zoom is ${minZoom}`)
  cy.centerMapOn(coord, zoom)
  withMap((map) => {
    Cypress.log({
      displayName: 'clickMapAtCoord',
      message: `([${coord[0]}, ${coord[1]}], ${zoom})`
    })
    const point = map.latLngToContainerPoint(coord)
    getMapDiv().click(point.x, point.y, {log: false})
  })
})

Cypress.Commands.add('clickStopOnMap', (name: string | RegExp) => {
  cy.findStop(name).then((stop) => cy.clickMapAtCoord(stop.latlng))
})

/**
 * Marker must be in view.
 */
Cypress.Commands.add(
  'dragMarker',
  (
    markerTitle: string,
    markerCoords: L.LatLngTuple,
    endCoords: L.LatLngTuple
  ) => {
    const log = false // set to true while debugging
    Cypress.log({
      displayName: 'dragMarker',
      message: `(${markerTitle} => [${endCoords[0]}, ${endCoords[1]}])`
    })
    withMap((map: L.Map) => {
      map.fitBounds([endCoords, markerCoords], {
        animate: false,
        duration: 0,
        padding: [10, 10]
      })
    })
    withMap((map: L.Map) => {
      const startPoint = map.latLngToContainerPoint(markerCoords)
      const endPoint = map.latLngToContainerPoint(endCoords)

      const offsetX = endPoint.x - startPoint.x
      const offsetY = endPoint.y - startPoint.y

      cy.findByTitle(markerTitle) // eslint-disable-line
        .trigger('mousedown', {
          log,
          which: 1
        })
        .wait(waitDuration, {log})
        // Important! Must trigger a small mouse move to tell Leaflet we are dragging.
        .trigger('mousemove', 5, 5, {
          force: true,
          log
        })
        .wait(waitDuration, {log})
        .trigger('mousemove', offsetX, offsetY, {
          force: true,
          log
        })
        .wait(waitDuration, {log})
        .trigger('mouseup', {
          force: true,
          log
        })
        .wait(waitDuration, {log})
    })
  }
)

Cypress.Commands.add(
  'findStop',
  (name: string | RegExp): Cypress.Chainable<Cypress.Stop> => {
    return getMapDiv()
      .findByText(name)
      .then((el) => {
        return {
          latlng: el
            .attr('data-coordinate')
            .split(',')
            .map((v: string) => parseFloat(v)) as L.LatLngTuple,
          id: el.attr('data-id')
        }
      })
  }
)

Cypress.Commands.add('waitForMapToLoad', () => {
  Cypress.log({displayName: 'waitForMapToLoad'})
  getMap().waitUntil(
    (map: L.Map) => new Promise((resolve) => map.whenReady(resolve)),
    {log: false}
  )
  return getMap()
})

Cypress.Commands.add(
  'mapCenteredOn',
  (latlng: L.LatLngTuple, tolerance: number) =>
    cy
      .getLeafletMap()
      .then((map) =>
        cy
          .wrap(map.distance(map.getCenter(), latlng))
          .should('be.lessThan', tolerance)
      )
)

Cypress.Commands.add('centerMapOn', (latlng: L.LatLngTuple, zoom = 15) => {
  withMap((map: L.Map) => {
    // centers map on a given lat/lon coordinate: [x,y]
    Cypress.log({
      displayName: 'centerMapOn',
      message: `([${latlng[0]}, ${latlng[1]}], ${zoom})`
    })
    map.setView(latlng, zoom, {animate: false, duration: 0})
  })
})
