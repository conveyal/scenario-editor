const getPrimary = () => cy.get('div#PrimaryAnalysisSettings')
const getComparison = () => cy.get('div#ComparisonAnalysisSettings')

const expandIfClosed = () => {
  // Expand JSON if it is not open
  cy.get('button', {log: false}).then((buttons) => {
    const pb = buttons.filter((_, el) => el.title === 'expand')
    if (pb.length !== 0) {
      cy.log('expanding analysis settings')
      cy.wrap(pb.first(), {log: false}).click({log: false})
    }
  })
}

Cypress.Commands.add('getPrimaryAnalysisSettings', () => {
  return getPrimary().within(($div) => {
    expandIfClosed()
    return $div
  })
})

Cypress.Commands.add('getComparisonAnalysisSettings', () => {
  return getComparison().within(($div) => {
    expandIfClosed()
    return $div
  })
})

/**
 * Sets a value in the custom JSON editor.
 */
Cypress.Commands.add('editPrimaryAnalysisJSON', (key, newValue) => {
  getPrimary()
    .findByRole('tab', {name: /Custom JSON editor/i})
    .click()

  getPrimary()
    .findByLabelText(/Customize analysis request/i)
    .as('profile')
    .invoke('val')
    .then((currentConfig) => {
      const newConfig = JSON.parse(currentConfig + '')
      newConfig[key] = newValue

      return cy
        .get('@profile')
        .invoke('val', JSON.stringify(newConfig, null, 2))
        .type(' {backspace}')
    })

  getPrimary()
    .findByRole('tab', {name: /Form editor/i})
    .click()
})

/**
 * Must be done within an open primary/comparison.
 */
Cypress.Commands.add(
  'patchAnalysisJSON',
  (newValues: Record<string, unknown>) => {
    cy.findByRole('tab', {name: /Custom JSON editor/i}).click()

    cy.findByLabelText(/Customize analysis request/i)
      .as('profile')
      .invoke('val')
      .then((currentConfig) => {
        const parsedConfig = JSON.parse(currentConfig + '')
        return cy
          .findByLabelText(/Customize analysis request/i)
          .invoke(
            'val',
            JSON.stringify({...parsedConfig, ...newValues}, null, 2)
          )
          .type(' {backspace}', {delay: 0})
      })

    cy.findByRole('tab', {name: /Form editor/i}).click()
  }
)

Cypress.Commands.add('setOrigin', (newOrigin: L.LatLngTuple) => {
  cy.getPrimaryAnalysisSettings().within(() => {
    cy.patchAnalysisJSON({
      fromLat: newOrigin[0],
      fromLon: newOrigin[1]
    })
  })
})

Cypress.Commands.add('fetchResults', () => {
  cy.findButton(/^Fetch results$/i) // eslint-disable-line cypress/no-unnecessary-waiting
    .click()
    .wait(200)
  // fetch results button usually disappears when clicked, but may not always
  // when it returns, we know the results have been fetched
  cy.findByRole('button', {name: /^Fetch results$/i, timeout: 240000}).should(
    'exist'
  )
})

Cypress.Commands.add('setTimeCutoff', (minutes: number) => {
  cy.findByLabelText(/Travel time: Cutoff (minutes)/).type(
    `{selectall}${minutes}`,
    {force: true}
  )
})

Cypress.Commands.add('selectDefaultOpportunityDataset', () => {
  cy.findByLabelText(/^Destination opportunity layer$/) // eslint-disable-line cypress/no-unnecessary-waiting
    .click({force: true})
    .type(`default{enter}`, {delay: 0})
    .wait(100)
  cy.findByLabelText(/^Destination opportunity layer$/).should('be.enabled')
})

Cypress.Commands.add(
  'setProjectScenario',
  (project: string, scenario = 'default') => {
    cy.findByLabelText(/^Project$/)
      .click({force: true})
      .type(`${project}{enter}`, {delay: 0})

    cy.findByLabelText(/^Scenario$/)
      .click({force: true})
      .type(`${scenario}{enter}`, {delay: 0})
  }
)

Cypress.Commands.add(
  'createRegionalAnalysis',
  (
    name: string,
    opportunityDatasets: string[],
    options?: {
      cutoffs?: number[]
      originPointSet?: string
      percentiles?: number[]
      timeout?: number
    }
  ) => {
    cy.getPrimaryAnalysisSettings()
      .findByRole('button', {name: 'Regional analysis'})
      .click()

    cy.findByLabelText(/Regional analysis name/).type(name, {delay: 0})

    if (options?.originPointSet) {
      cy.findByLabelText(/Origin points/)
        .click({force: true})
        .type(`${options.originPointSet}{enter}`)
    }

    opportunityDatasets.forEach((od) => {
      cy.findByLabelText(/Destination opportunity layer\(s\)/)
        .click({force: true})
        .type(`${od}{enter}`)
    })

    if (options?.cutoffs) {
      cy.findByLabelText('Cutoff minutes')
        .clear()
        .type(options?.cutoffs.join(','))
    }

    if (options?.percentiles) {
      cy.findByLabelText('Percentiles')
        .clear()
        .type(options?.percentiles.join(','))
    }

    cy.findByRole('button', {name: /Create/}).click()

    // Ensure the success toast is shown, and click on it
    cy.findToast().click({force: true})

    // Navigates to regional analysis page
    cy.findByRole('heading', {name: /Regional Analyses/i, timeout: 15000})

    // Wait for a display to show origins
    cy.findByRole('heading', {name})
      .parent()
      .parent()
      .findByText(/\d+ \/ \d+ origins/)

    // Wait for the status box to disappear
    cy.findByRole('heading', {
      name,
      timeout: options?.timeout ?? 600000
    }).should('not.exist')

    // Navigate to the completed regional analysis
    cy.findByText(/View a regional analysis/)
      .click()
      .type(`${name}{enter}`)

    cy.navComplete()
  }
)
