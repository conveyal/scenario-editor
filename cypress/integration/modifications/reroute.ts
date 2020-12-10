import {getDefaultRegion} from '../utils'

describe('Reroute', () => {
  const region = getDefaultRegion()
  const project = region.getProject('Reroute Tests')
  const rerouteModification = project.getModification({
    type: 'Reroute',
    data: {
      // reset
      fromStop: null,
      toStop: null,
      segments: [],
      segmentSpeeds: []
    }
  })

  /**
   * Related https://github.com/conveyal/analysis-ui/issues/1368
   */
  it('should be able to add a stop along the reroute detour', () => {
    rerouteModification.navTo()
    cy.findByLabelText(/Select route/)
      .click({force: true})
      .type('Southbank{enter}')

    cy.findButton(/Select from stop/).click()
    cy.clickStopOnMap(/Monmouth at Third - Out/)
    cy.findButton(/Select to stop/).click()
    cy.clickStopOnMap(/Riviera at Fairfield - Out/)
    cy.findButton(/Edit route geometry/).click()
    cy.clickMapAtCoord([39.09732862693217, -84.4918155670166], 15) // About halfway between
    cy.findButton(/Stop editing/).click()

    // Open the segment speeds and verify that there are two segments
    cy.findButton(/Set individual segment speeds/).click()
    cy.findAllByLabelText(/Segment \d speed/).should('have.length', 2)
  })
})
