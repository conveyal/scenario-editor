import {getDefaultRegion, scratchRegion} from '../utils'

describe('Regional', () => {
  const region = getDefaultRegion()

  describe('Create Modal', () => {
    before(() => {
      region.initializeAnalysisDefaults()
      region.fetchAccessibilityComparison(region.center)
      cy.getPrimaryAnalysisSettings().within(() => {
        cy.findButton(/Regional analysis/).click()
      })
    })

    it('should show total origins', () => {
      cy.findByText(/Analysis will run for 11,644 origin points/)
    })

    it(
      'should show error if opportunity datasets selected are not the same size'
    )
    it(
      'should show error if a freeform pointset and other opportunity datasets are selected'
    )
  })

  describe('Results', () => {
    const regionalAnalysis = region.getRegionalAnalysis('Basic Regional Test', {
      settings: {
        bounds: scratchRegion.customRegionSubset
      }
    })

    // For faster testing results, comment out the below
    after(() => regionalAnalysis.delete())

    beforeEach(() => {
      cy.findByText(/Access to/i)
        .parent()
        .as('legend')
    })

    it('verifies regional analysis results', function () {
      cy.get('@legend').should('not.contain', 'Loading grids')
      // compare to self with different time cutoff and check the legend again
      cy.findByLabelText(/Compare to/).type(`${regionalAnalysis.name}{enter}`, {
        force: true
      })
      // TODO make these select elements easier to identify
      cy.findByText(/Compare to/)
        .parent()
        .parent()
        .findByRole('option', {name: '45 minutes'})
        .parent()
        .select('60 minutes')
      cy.get('@legend').should('not.contain', 'Loading grids')
      // test aggreation area upload
      cy.findByText(/upload new aggregation area/i).click()
      cy.findByRole('button', {name: 'Upload'})
        .as('upload')
        .should('be.disabled')
      cy.findByLabelText(/Aggregation area name/i).type('cities')
      cy.findByLabelText(/Select aggregation area files/i)
        .attachFile({
          filePath: scratchRegion.aggregationAreas.files[0],
          encoding: 'base64'
        })
        .attachFile({
          filePath: scratchRegion.aggregationAreas.files[1],
          encoding: 'base64'
        })
        .attachFile({
          filePath: scratchRegion.aggregationAreas.files[2],
          encoding: 'base64'
        })
        .attachFile({
          filePath: scratchRegion.aggregationAreas.files[3],
          encoding: 'base64'
        })
      cy.findByLabelText(/Union/).uncheck({force: true})
      cy.findByLabelText(/Shapefile attribute to use as aggregation area name/i)
        .clear()
        .type(scratchRegion.aggregationAreas.nameField)
      cy.get('@upload').scrollIntoView().click()
      cy.contains(/Upload complete/, {timeout: 30000}).should('be.visible')
      // TODO label dissociated from input
      //cy.findByLabelText(/Aggregate results to/i)
      //  .type(this.region.aggregationAreas.sampleName+'{enter}')
    })
  })

  it('test starting and deleting a running analysis')
  // cy.findByRole('button', {name: /Delete/}).click()
  // cy.findByRole('button', {name: /Confirm/}).click()

  // TODO this is partly tested above but should be refactored into its own
  // test here. This will require setting up an analysis first though
  it('compares two regional analyses')

  // TODO this is partly tested above, but should be separated out into its
  // own test here. Aggregation is blocked by a dissociated label
  // (see note above)
  it('uploads an aggregation area and aggregates results')
})
