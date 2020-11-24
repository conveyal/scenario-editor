import {getDefaultRegion, scratchRegion} from '../utils'

describe('Add Trip Pattern', () => {
  const region = getDefaultRegion()
  const timetableName = 'Weekday'
  const project = region.getProject('Add Trip Pattern')
  const mod = project.getModification({
    type: 'Add Trip Pattern',
    onCreate: () => {
      // add a route geometry
      cy.drawRouteGeometry(scratchRegion.newRoute as L.LatLngTuple[])

      cy.findByText(/Add new timetable/).click()
      cy.findByText('Timetable 1').click({force: true})
      // enter arbitrary settings to see if they get saved
      cy.findByLabelText('Name').clear().type(timetableName)
      cy.findByLabelText(/Mon/).check()
      cy.findByLabelText(/Tue/).check()
      cy.findByLabelText(/Wed/).check()
      cy.findByLabelText(/Thu/).check()
      cy.findByLabelText(/Fri/).check()
      cy.findByLabelText(/Sat/).uncheck({force: true})
      cy.findByLabelText(/Sun/).uncheck({force: true})
      cy.findByLabelText(/Frequency/)
        .clear()
        .type('00:20:00')
      cy.findByLabelText(/Start time/)
        .clear()
        .type('06:00')
      cy.findByLabelText(/End time/)
        .clear()
        .type('23:00')
      cy.findByLabelText(/dwell time/)
        .clear()
        .type('00:00:30')
      cy.findByText(timetableName).click({force: true}) // hide panel
    }
  })

  // Clean up any failed tests
  before(() => {
    project.deleteModification(mod.name + ' (copy)')
  })

  it('should be able to create and reuse timetables', () => {
    // Copy the current modification and navigate to it by clicking the toast
    mod.navTo()
    cy.findByRole('button', {name: /Copy modification/i}).click()
    cy.loadingComplete()
    cy.get('#react-toast').findByRole('alert').click({force: true})
    cy.navComplete()

    cy.findByText(/Copy existing timetable/).click()
    cy.findByRole('dialog').within(() => {
      cy.findByText(/Loading/).should('not.exist')
      cy.findByLabelText(/Region/).select(region.name)
      cy.findByLabelText(/Project/).select(project.name)
      cy.findByLabelText(/Modification/).select(mod.name)
      cy.findByLabelText(/Timetable/).select(timetableName)
    })
    cy.findByText(/Copy into new timetable/i).click()
    cy.contains(`Copy of ${timetableName}`).click({force: true})
    // verify the settings from above
    cy.findByLabelText(/Mon/).should('be.checked')
    cy.findByLabelText(/Tue/).should('be.checked')
    cy.findByLabelText(/Wed/).should('be.checked')
    cy.findByLabelText(/Thu/).should('be.checked')
    cy.findByLabelText(/Fri/).should('be.checked')
    cy.findByLabelText(/Sat/).should('not.be.checked')
    cy.findByLabelText(/Sun/).should('not.be.checked')
    cy.findByLabelText(/Frequency/)
      .invoke('val')
      .should('eq', '00:20:00')
    cy.findByLabelText(/Start time/)
      .invoke('val')
      .should('eq', '06:00')
    cy.findByLabelText(/End time/)
      .invoke('val')
      .should('eq', '23:00')

    // Delete the copied modification
    cy.deleteThisModification()
  })
})
