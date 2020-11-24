import region from '../fixtures/regions/scratch.json'

import './commands'
import './map'

Cypress.Commands.add('createModification', function (
  type: Cypress.ModificationType,
  name: string
) {
  // assumes we are already on this page or editing another mod
  cy.findByText('Create a modification').click()
  cy.findByLabelText(/Modification name/i).type(name, {delay: 0})
  if (type.indexOf('Street') > -1) {
    cy.findByText('Street').click()
    cy.findByLabelText(/Street modification type/i).select(type)
  } else {
    cy.findByLabelText(/Transit modification type/i).select(type)
  }
  cy.findByText('Create').click()
  cy.findByRole('dialog').should('not.exist')
  cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
  cy.navComplete()
})

Cypress.Commands.add('deleteModification', function (name) {
  cy.openModification(name)
  cy.deleteThisModification()
})

Cypress.Commands.add('deleteThisModification', function () {
  // Delete an open modification
  cy.findByRole('button', {name: 'Delete modification'}).click()
  cy.findByRole('button', {name: 'Confirm: Delete modification'}).click()
  cy.findByRole('dialog').should('not.exist')
  cy.navComplete()
  cy.contains('Create a modification')
  cy.wait(100) // eslint-disable-line
  cy.navComplete() // Modifications are not loaded in GetInitialProps
})

Cypress.Commands.add('drawRouteGeometry', function (newRoute: L.LatLngTuple[]) {
  cy.findByRole('button', {name: /Edit route geometry/i})
    .click()
    .contains(/Stop editing/i)

  // click at the coordinates
  newRoute.forEach((coord, i) => {
    cy.clickMapAtCoord(coord)
    if (i > 0) {
      cy.contains(new RegExp(i + 1 + ' stops over \\d\\.\\d+ km'))
    }
  })

  // convert an arbitrary stop to a control point
  const stop = newRoute[newRoute.length - 2]
  cy.clickMapAtCoord(stop)
  cy.findByRole('button', {name: /make control point/i}).click()

  // control point not counted as stop
  cy.contains(new RegExp(newRoute.length - 1 + ' stops over \\d\\.\\d+ km'))

  // convert control point back to stop
  cy.clickMapAtCoord(stop)
  cy.findByRole('button', {name: /make stop/i}).click()
  cy.contains(new RegExp(newRoute.length + ' stops over \\d\\.\\d+ km'))

  // Exit editing mode
  cy.findByRole('button', {name: /Stop editing/i}).click()
})

Cypress.Commands.add('editModificationJSON', function (
  newValues: Record<string, unknown>
) {
  cy.findByRole('tab', {name: /Edit JSON/}).click()
  cy.get('textarea')
    .invoke('val')
    .then((currentConfig) => {
      const parsedConfig = JSON.parse(currentConfig + '')
      return cy
        .get('textarea')
        .invoke('val', JSON.stringify({...parsedConfig, ...newValues}, null, 2))
        .type(' {backspace}')
    })
  cy.findByRole('button', {name: /Save custom changes/i}).click()
  cy.findByRole('tab', {name: /Edit value/}).click()
})

function regExFromName(name: string) {
  return new RegExp(name.replace('(', '\\(').replace(')', '\\)'))
}

Cypress.Commands.add('openModification', function (modName: string) {
  // opens the first listed modification of this type with this name
  cy.findByRole('tab', {name: /Modifications/g}).click()
  cy.findByRole('button', {name: regExFromName(modName)}).click()
  cy.navComplete()
})

Cypress.Commands.add('selectDefaultFeedAndRoute', function () {
  cy.selectFeed(region.feedAgencyName)
  cy.selectRoute(region.sampleRouteName)
})

Cypress.Commands.add('selectFeed', function selectFeed(feedName: string) {
  cy.findByLabelText(/Select feed/)
    .click({force: true})
    .type(feedName + '{enter}', {delay: 0})
  cy.loadingComplete()
})

Cypress.Commands.add('selectRoute', function selectRoute(routeName: string) {
  cy.findByLabelText(/Select route/)
    .click({force: true})
    .type('{backspace}' + routeName + '{enter}', {delay: 0})
  cy.loadingComplete()
})
