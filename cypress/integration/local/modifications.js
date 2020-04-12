describe('Modifications', () => {
  before(() => {
    cy.setupProject('scratch')
  })

  beforeEach(() => {
    cy.findByTitle(/Edit Modifications/).click({force: true})
    cy.location('pathname').should('match', /.*\/projects\/.{24}$/)
  })

  it('can be created and deleted', () => {
    // create an arbitrary modification type
    // these actions should be the same across all types
    let mods = [
      'Add Trip Pattern',
      'Adjust Dwell Time',
      'Adjust Speed',
      'Convert To Frequency',
      'Remove Stops',
      'Remove Trips',
      'Reroute',
      'Custom'
    ]
    let modType = mods[Math.floor(Math.random() * mods.length)]
    let modName = 'tempMod ' + Date.now()
    cy.findByRole('link', {name: 'Create a modification'}).click()
    cy.findByLabelText(/Modification type/i).select(modType)
    cy.findByLabelText(/Modification name/i).type(modName)
    cy.findByRole('link', {name: 'Create'}).click()
    cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
    cy.contains(modName)
    cy.findByRole('link', {name: /Add description/}).click()
    cy.findByLabelText('Description').type('descriptive text')
    // TODO go back and see if it saved
    //cy.findByTitle(/Edit Modifications/).click({force: true})
    //cy.location('pathname').should('match', /\/projects\/.{24}$/)
    //cy.contains(modType)
    //  .parent()
    //  .contains(modName)
    //  .click()
    //cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
    //cy.contains(modName)
    // for now though just delete it immediately
    cy.get('a[name="Delete modification"]').click()
    cy.location('pathname').should('match', /.*\/projects\/.{24}$/)
    cy.contains('Create a modification')
    cy.findByText(modName).should('not.exist')
  })

  it('saves Add Trip Pattern mod', () => {
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
})
