const now = Date.now() + ''

const localState = {
  region: {
    name: now + ': Test Region'
  }
}

const pbfName = 'noma-dc.osm.pbf'

describe('Test suite to be run in a local development environment with auth disabled', () => {
  it('should not require being logged in to load the home page', () => {
    cy.visit('/')
    cy.findByText('Set up a new region').should('exist')
  })

  it('should be able to create a region', function() {
    cy.visit('/')
    cy.findByText('Set up a new region').click()
    cy.findByPlaceholderText('Region Name', {exact: false}).type(
      localState.region.name
    )

    cy.fixture(pbfName, {encoding: 'base64'}).then(fileContent => {
      console.log(fileContent)
      cy.findByLabelText('OpenStreetMap data in PBF format*').upload({
        encoding: 'base64',
        fileContent,
        fileName: pbfName,
        mimeType: 'application/octet-stream'
      })

      cy.findByRole('button', {name: 'Set up a new region'}).click()
    })
  })
})
