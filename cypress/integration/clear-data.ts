import {clearTemporaryData} from './utils'

describe.skip('Clear all test data', () => {
  before(() => {
    clearTemporaryData()
  })

  it('should have no data in local storage', () => {
    cy.window()
      .then((win) => !!win.localStorage.getItem('localModelPaths'))
      .should('be.false')
  })

  // TODO add database clearing section
})
