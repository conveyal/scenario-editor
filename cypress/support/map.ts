const getMapDiv = () => cy.get('div.leaflet-container', {log: false})
const getMap = (): Cypress.Chainable<L.Map> =>
  cy.window({log: false}).its('LeafletMap', {log: false})

// Reusable command for getting the map container
Cypress.Commands.add('getMapDiv', getMapDiv)
Cypress.Commands.add('getLeafletMap', getMap)

const waitDuration = 100
const minZoom = 12

Cypress.Commands.add('clickMapAtCoord', (coord: L.LatLngTuple, zoom = 18) => {
  if (zoom < minZoom)
    throw new Error(`Minimum clickMapAtCoord zoom is ${minZoom}`)
  cy.centerMapOn(coord, zoom)
  cy.getLeafletMap().then((map) => {
    Cypress.log({
      displayName: 'clickMapAtCoord',
      message: `([${coord[0]}, ${coord[1]}], ${zoom})`
    })
    const point = map.latLngToContainerPoint(coord)
    getMapDiv().click(point.x, point.y, {log: false})
    cy.wait(waitDuration, {log: false}) // eslint-disable-line
  })
})

Cypress.Commands.add('waitForMapToLoad', () => {
  Cypress.log({displayName: 'waitForMapToLoad'})
  getMap().waitUntil(
    (map: L.Map) => new Promise((resolve) => map.whenReady(resolve))
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
  cy.waitForMapToLoad().then((map: L.Map) => {
    // centers map on a given lat/lon coordinate: [x,y]
    Cypress.log({
      displayName: 'centerMapOn',
      message: `([${latlng[0]}, ${latlng[1]}], ${zoom})`
    })
    map.setView(latlng, zoom, {animate: false, duration: 0})
    cy.wait(waitDuration, {log: false}) // eslint-disable-line
  })
})
