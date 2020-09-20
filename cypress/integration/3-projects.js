describe('Projects', function () {
  before('prepare the region and bundle', () => {
    cy.setup('bundle')
  })

  it('can be created and deleted', () => {
    const projectName = Cypress.env('dataPrefix') + ' ' + Date.now()
    const bundleName = Cypress.env('dataPrefix') + 'scratch bundle'
    cy.navTo('Projects')
    cy.findByText(/Create new Project/i).click()
    cy.navComplete()

    cy.findByLabelText(/Project name/).type(projectName)
    // select the scratch bundle
    cy.findByLabelText(/Associated network bundle/i)
      .click({force: true})
      .type(`{enter}${bundleName}{enter}`)
    cy.findByText('Create').click()
    cy.navComplete()

    // make sure it's listed on the projects page
    cy.navTo('Projects')
    cy.findByText(projectName).click()
    cy.findByLabelText('Edit project settings').click()
    cy.navComplete()

    cy.findByLabelText(/Project name/)
      .invoke('val')
      .then((val) => expect(val).to.eq(projectName))
    // check that the bundle is associated and can't now be deleted
    cy.findByRole('link', {name: /view bundle info/i}).click()
    cy.navComplete()
    cy.contains(/Create a new network bundle/)
    cy.findByLabelText(/Network bundle name/i)
      .invoke('val')
      .then((val) => expect(val).to.eq(bundleName))
    cy.findByText(/Delete this network bundle/i).should('not.exist')
    cy.contains(/Currently used by \d+ project/i)
    // should be selectable in analysis
    cy.navTo('Analyze')
    cy.findAllByLabelText(/^Project$/)
      .first()
      .click({force: true})
      .type(projectName + '{enter}')
    cy.contains(projectName)
    cy.findAllByLabelText(/^Scenario$/)
      .first()
      .click({force: true})
      .type('Baseline{enter}')
    cy.contains(/Baseline/)
    // delete the project
    cy.navTo('Projects')
    cy.findByText(projectName).click()
    cy.navComplete()
    cy.findByLabelText('Edit project settings').click()
    cy.navComplete()
    cy.findByText(/Delete project/i).click()
    cy.navComplete()
    cy.location('pathname').should('match', /regions\/.{24}$/)
    cy.findByText(projectName).should('not.exist')
  })
})
