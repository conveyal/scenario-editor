Cypress.Commands.add('createRegion', function (
  name: string,
  bounds: CL.Bounds
): Cypress.Chainable<string> {
  Cypress.log({
    displayName: 'creating',
    message: 'region'
  })
  cy.visit('/regions/create')
  cy.findByLabelText(/Region Name/).type(name, {delay: 0})
  cy.findByLabelText(/North bound/)
    .clear()
    .type(bounds.north.toString(), {delay: 0})
  cy.findByLabelText(/South bound/)
    .clear()
    .type(bounds.south.toString(), {delay: 0})
  cy.findByLabelText(/West bound/)
    .clear()
    .type(bounds.west.toString(), {delay: 0})
  cy.findByLabelText(/East bound/)
    .clear()
    .type(bounds.east.toString(), {delay: 0})
  cy.findByRole('button', {name: /Set up a new region/}).click()
  cy.findByRole('button', {name: /Creating region/}).should('not.exist')
  cy.navComplete()
  return cy
    .location('pathname')
    .should('match', /regions\/\w{24}$/)
    .then((path): string => {
      return path.match(/\w{24}$/)[0]
    })
})
