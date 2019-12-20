describe('Sample status check', () => {
  it('Loads production', () => {
    cy.visit('https://analysis.conveyal.com')
    cy.screenshot()
  })
})
