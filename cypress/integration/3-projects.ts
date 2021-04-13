import {getDefaultRegion} from './utils'

describe('Projects', function () {
  const region = getDefaultRegion()

  it('can be created and deleted', () => {
    region.navTo('projects')

    cy.findByText(/Create new Project/i).click()
    cy.navComplete()

    const projectName = Cypress.env('dataPrefix') + 'Test Project'
    cy.findByLabelText(/Project name/).type(projectName)
    // select the scratch bundle
    cy.findByLabelText(/Associated network bundle/i)
      .click({force: true})
      .type(`{enter}${region.defaultBundle.name}{enter}`)
    cy.findByText('Create').click()
    cy.navComplete()

    // make sure it's listed on the projects page
    region.navTo('projects')
    cy.findAllByText(projectName).first().click()
    cy.findByLabelText('Edit project settings').click()
    cy.navComplete()

    cy.findByLabelText(/Project name/)
      .invoke('val')
      .should('equal', projectName)
    // check that the bundle is associated and can't now be deleted
    cy.findByRole('link', {name: /view bundle info/i}).click()
    cy.navComplete()
    cy.contains(/Create a new network bundle/)
    cy.findByLabelText(/Network bundle name/i)
      .invoke('val')
      .should('equal', region.defaultBundle.name)
    cy.findByText(/Delete this network bundle/i).should('not.exist')
    cy.contains(/Currently used by \d+ project/i)

    // should be selectable in analysis
    region.navTo('analyze')
    cy.getPrimaryAnalysisSettings().within(() => {
      cy.findByLabelText(/^Project$/)
        .click({force: true})
        .type(projectName + '{enter}')
      cy.contains(projectName)
      cy.findByLabelText(/^Scenario$/)
        .click({force: true})
        .type('Baseline{enter}')
      cy.contains(/Baseline/)
    })

    // delete the project
    region.navTo('projects')
    cy.findAllByText(projectName).first().click()
    cy.navComplete()
    cy.findByLabelText('Edit project settings').click()
    cy.navComplete()
    cy.findByText(/Delete project/i).click()
    cy.findButton(/Confirm/i).click()
    cy.navComplete()
    cy.location('pathname').should('match', /regions\/.{24}$/)

    // Page reload is necessary to pass in headless mode
    cy.reload()
    cy.findByText(projectName).should('not.exist')
  })
})
