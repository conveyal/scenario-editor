describe('Modifications', () => {
  before(() => {
    cy.setupProject('scratch')
  })

  it('Adjust dwell time', () => {
    cy.findByRole('link', {name: 'Create a modification'}).click()
    cy.findByLabelText(/Modification type/i).select('Adjust Dwell Time')
    cy.findByLabelText(/Modification name/i).type('Dwell adjust mod')
    cy.findByRole('link', {name: 'Create'}).click()
    cy.location('pathname').should(
      'match',
      /regions\/.{24}\/projects\/.{24}\/.{24}/
    )
    cy.contains('Dwell adjust mod')
    cy.findByRole('link', {name: /Add description/}).click()
    cy.findByLabelText('Description').type('the description')
    cy.findByLabelText(/Select feed and routes/i)
      .click()
      .type('{downarrow}{enter}')
  })

  it('Adjust speed', () => {})

  it('Remove trips', () => {})
})
