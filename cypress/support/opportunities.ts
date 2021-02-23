Cypress.Commands.add(
  'createOpportunityDataset',
  function (
    name: string,
    filePath: string,
    isFreeform = false,
    idField = 'id'
  ): Cypress.Chainable<string> {
    Cypress.log({
      displayName: 'creating',
      message: 'opportunities'
    })

    cy.findButton(/Upload a new dataset/i).click()
    cy.navComplete()
    cy.findByLabelText(/Spatial dataset name/i).type(name)
    cy.findByLabelText(/Select spatial dataset/).attachFile({
      filePath,
      encoding: 'base64'
    })

    if (filePath.endsWith('csv')) {
      cy.findByLabelText(/Latitude/)
        .clear()
        .type('lat')
      cy.findByLabelText(/Longitude/)
        .clear()
        .type('lon')
    }

    if (isFreeform) {
      cy.findByLabelText(/Enable freeform (non-grid) points/).click({force: true})
      cy.findByLabelText(/ID field/).type(idField)
    }

    cy.findButton(/Upload a new spatial dataset/).click()
    cy.navComplete()
    // find the message showing this upload is complete
    cy.contains(new RegExp(name + ' \\(DONE\\)'), {timeout: 5000})
      .parent()
      .parent()
      .as('notice')
    // check number of fields uploaded
    cy.get('@notice').contains(/Finished uploading \d layer/i)
    // close the message
    cy.get('@notice').findByRole('button', {name: /Close/}).click()
    // now grab the ID
    cy.findByText(/Select\.\.\./)
      .click()
      .type(`${name} {enter}`)
    return cy
      .location('href')
      .should('match', /.*DatasetId=\w{24}$/)
      .then((href): string => href.match(/\w{24}$/)[0])
  }
)
