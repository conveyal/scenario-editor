import {getDefaultRegion} from './utils'

function findScenarioByName(name: string) {
  return cy.get('#scenarios').contains(name).parent().parent().parent()
}

describe('Scenarios', function () {
  const region = getDefaultRegion()
  const project = region.getProject('Scenario Test')

  before(() => {
    project.navTo()
    cy.findByText(/Scenarios/).click()

    // Clear all existing scenarios
    cy.get('#scenarios')
      .findAllByRole('group')
      .each((group, index) => {
        if (index !== 0) {
          cy.wrap(group)
            .parent()
            .parent()
            .findByRole('button', {name: 'Delete this scenario'})
            .click()
          cy.findByRole('button', {
            name: 'Confirm: Delete this scenario'
          }).click()
          cy.findByRole('alertdialog').should('not.exist')
        } else {
          // Ensure the remaining scenario is named Default
          cy.wrap(group).parent().parent().click().type('Default{enter}')
        }
      })
  })

  it('baseline scenario cannot be copied, deleted, or renamed', () => {
    findScenarioByName('Baseline')
      .findByRole('button', {name: /Delete this scenario/})
      .should('not.exist')
  })

  it('default scenario should exist and cannot be deleted, but can be copied and renamed', () => {
    const defaultName = 'Default'
    const newName = Cypress.env('dataPrefix') + 'scenario'

    findScenarioByName(defaultName)
      .findByRole('button', {name: /Delete this scenario/})
      .should('not.exist')

    findScenarioByName(defaultName).findByRole('button', {
      name: 'Copy scenario'
    })

    findScenarioByName(defaultName)
      .click()
      .parent()
      .findByDisplayValue(defaultName)
      .type(newName + '{enter}')

    findScenarioByName(newName)
      .click()
      .parent()
      .findByDisplayValue(newName)
      .type(defaultName + '{enter}')
  })

  it('new scenario can be created, copied, renamed, & deleted', function () {
    const scenarioName = Cypress.env('dataPrefix') + 'scenario ' + Date.now()
    // create
    cy.findByText('Create a scenario').click()

    // rename
    findScenarioByName('Scenario 2')
      .click()
      .parent()
      .findByDisplayValue('Scenario 2')
      .type(scenarioName + '{enter}')

    // copy
    findScenarioByName(scenarioName)
      .findByRole('button', {name: 'Copy scenario'})
      .click()

    // delete copy
    findScenarioByName(scenarioName + ' (copy)')
      .findByRole('button', {name: 'Delete this scenario'})
      .click()
    cy.findByRole('button', {name: 'Confirm: Delete this scenario'}).click()

    // delete first scenario
    findScenarioByName(scenarioName)
      .findByRole('button', {name: 'Delete this scenario'})
      .click()
    cy.findByRole('button', {name: 'Confirm: Delete this scenario'}).click()
  })
})
