Cypress.Commands.add(
  'createBundle',
  function (
    name: string,
    gtfsFilePath: string,
    pbfFilePath: string
  ): Cypress.Chainable<string> {
    Cypress.log({
      displayName: 'creating',
      message: 'bundle'
    })

    cy.findByText(/Create a new network bundle/).click()
    cy.findByLabelText(/Network bundle name/i).type(name, {delay: 0})
    cy.findByText(/Upload new OpenStreetMap/i).click()
    cy.findByLabelText(/Select PBF file/i).attachFile({
      filePath: pbfFilePath,
      encoding: 'base64',
      mimeType: 'application/octet-stream'
    })
    cy.findByText(/Upload new GTFS/i).click()
    cy.findByLabelText(/Select .*GTFS/i).attachFile({
      filePath: gtfsFilePath,
      encoding: 'base64',
      mimeType: 'application/octet-stream'
    })
    cy.findByRole('button', {name: /Create/i}).click()

    // Popover should show up
    cy.findTask('Processing bundle ' + name).within(() => {
      // Completed text should appear
      cy.findByText(/Completed\./, {timeout: 240_000})

      // Click "View work product" button (which also clears the task)
      cy.findButton(/View work product/).click()

      // Wait for navigation to finish
      cy.navComplete()
    })

    return cy
      .location('pathname')
      .should('match', /bundles\/\w{24}$/)
      .then((path): string => path.match(/\w{24}$/)[0])
  }
)
