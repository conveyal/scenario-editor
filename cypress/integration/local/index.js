const runTime = new Date()
const regionName = 'Scratch Region ' + runTime.toUTCString()

describe('Local Tests', () => {
  beforeEach('load scratch fixture', function() {
    cy.fixture('regions/scratch.json').as('scratchRegion')
  })

  context('Create modifications', () => {
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

  context('Delete scratch region', () => {
    it('Delete region', () => {
      cy.visit('/')
      cy.findByText(regionName).click()
      cy.get('svg[data-icon="map"]').click()
      cy.findByText(/Delete this region/).click()
    })
  })
})
