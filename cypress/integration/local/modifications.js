describe('Modifications', () => {
  before(() => {
    cy.setupProject('scratch')
  })

  beforeEach(() => {
    cy.findByTitle(/Edit Modifications/).click({force: true})
    cy.location('pathname').should('match', /.*\/projects\/.{24}$/)
  })

  it('creates Add Trip Pattern mod', () => {
    let modName = 'Add Trip ' + Date.now()
    cy.findByRole('link', {name: 'Create a modification'}).click()
    cy.findByLabelText(/Modification type/i).select('Add Trip Pattern')
    cy.findByLabelText(/Modification name/i).type(modName)
    cy.findByRole('link', {name: 'Create'}).click()
    cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
    // now editing the modification
    cy.contains(modName)
    cy.findByRole('link', {name: /Add description/}).click()
    cy.findByLabelText('Description').type('the description')
    // go back and see if this saved
    cy.findByTitle(/Edit Modifications/).click({force: true})
    cy.location('pathname').should('match', /\/projects\/.{24}$/)
    cy.contains(/Add Trip Pattern/)
      .parent()
      .contains(modName)
  })

  it('creates Adjust Speed mod', () => {
    let modName = 'Change Speed ' + Date.now()
    cy.findByRole('link', {name: 'Create a modification'}).click()
    cy.findByLabelText(/Modification type/i).select('Adjust Speed')
    cy.findByLabelText(/Modification name/i).type(modName)
    cy.findByRole('link', {name: 'Create'}).click()
    cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
    cy.contains(modName)
    cy.findByRole('link', {name: /Add description/}).click()
    cy.findByLabelText('Description').type('the description')
    // TODO can't select feed yet so go back and see if this saved
    cy.findByTitle(/Edit Modifications/).click({force: true})
    cy.location('pathname').should('match', /\/projects\/.{24}$/)
    cy.contains(/Adjust Speed/)
      .parent()
      .contains(modName)
  })

  it('Remove trips', () => {})
})
