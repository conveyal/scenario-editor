Cypress.Commands.add(
  'createOpportunityDataset',
  function (name: string, filePath: string): Cypress.Chainable<string> {
    Cypress.log({
      displayName: 'creating',
      message: 'opportunities'
    })

    cy.findButton(/Upload a new dataset/i).click()
    cy.navComplete()
    cy.findByLabelText(/Spatial dataset name/i).type(name)
    cy.findByLabelText(/Select opportunity dataset/).attachFile({
      filePath,
      encoding: 'base64'
    })
    cy.findButton(/Upload a new opportunity dataset/).click()
    cy.navComplete()
    // find the message showing this upload is complete
    cy.contains(new RegExp(name + ' \\(DONE\\)'), {timeout: 5000})
      .parent()
      .parent()
      .as('notice')
    // check number of fields uploaded
    cy.get('@notice').contains(/Finished uploading 1 layer/i)
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
