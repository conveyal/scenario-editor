import './commands'
import './map'

Cypress.Commands.add(
  'createModification',
  function (type: Cypress.ModificationType, name: string) {
    // assumes we are already on this page or editing another mod
    cy.findButton('Create a modification').click()
    cy.findByLabelText(/Modification name/i).type(name, {delay: 0})
    if (type.indexOf('Street') > -1) {
      cy.findByText('Street').click()
      cy.findByLabelText(/Street modification type/i).select(type)
    } else {
      cy.findByLabelText(/Transit modification type/i).select(type)
    }
    cy.findButton('Create').click()
    cy.findByRole('dialog').should('not.exist')
    cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
    cy.navComplete()
  }
)

Cypress.Commands.add('deleteModification', function (name) {
  cy.openModification(name)
  cy.deleteThisModification()
})

Cypress.Commands.add('deleteThisModification', function () {
  // Delete an open modification
  cy.findButton('Delete modification').click()
  cy.findButton('Confirm: Delete modification').click()
  cy.findByRole('dialog').should('not.exist')
  cy.navComplete()
  cy.contains('Create a modification')
  cy.wait(100) // eslint-disable-line
  cy.navComplete() // Modifications are not loaded in GetInitialProps
})

Cypress.Commands.add('drawRouteGeometry', function (newRoute: L.LatLngTuple[]) {
  cy.findButton(/Edit route geometry/i).click()

  // Did the button switch?
  cy.findButton(/Stop editing/i)

  // click at the coordinates
  newRoute.forEach((coord, i) => {
    cy.clickMapAtCoord(coord)
    if (i > 0) {
      cy.contains(new RegExp(i + 1 + ' stops over \\d\\.\\d+ km'))
    }
  })

  // Exit editing mode
  cy.findButton(/Stop editing/i).click()
  cy.findButton(/Edit route geometry/i)
})

Cypress.Commands.add(
  'editModificationJSON',
  function (newValues: Record<string, unknown>) {
    cy.findByRole('tab', {name: /Edit JSON/}).click()
    cy.get('textarea')
      .invoke('val')
      .then((currentConfig) => {
        const parsedConfig = JSON.parse(currentConfig + '')
        return cy
          .get('textarea')
          .invoke(
            'val',
            JSON.stringify({...parsedConfig, ...newValues}, null, 2)
          )
          .type(' {backspace}')
      })
    cy.findByRole('button', {name: /Save custom changes/i}).click()
    cy.findByRole('tab', {name: /Edit value/}).click()
  }
)

function regExFromName(name: string) {
  return new RegExp(name.replace('(', '\\(').replace(')', '\\)'))
}

Cypress.Commands.add('openModification', function (modName: string) {
  // opens the first listed modification of this type with this name
  cy.findByRole('tab', {name: /Modifications/g}).click()
  cy.findByRole('button', {name: regExFromName(modName)}).click()
  cy.navComplete()
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
