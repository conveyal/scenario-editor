import scratchRegion from '../fixtures/regions/scratch.json'

import Bundle from './bundle'
import Model from './model'
import OpportunityData from './opportunity-data'
import Project from './project'
import RegionalAnalysis from './regional-analysis'

type ProjectAnalysisSettings = {
  project?: Project
  scenario?: string
  settings?: Record<string, unknown>
}

type RegionalAnalysisOptions = {
  project?: Project
  scenario?: string
  settings?: Record<string, unknown>
  opportunityDatasets?: string[]
  cutoffs?: number[]
  percentiles?: number[]
}

export default class Region extends Model {
  defaultBundle: Bundle
  defaultOpportunityDataset: OpportunityData
  defaultProject: Project

  delete() {
    this.navTo()
    cy.navTo('region settings')
    // Delete region
    cy.findByText(/Delete this region/).click()
    cy.findByText(/Confirm: Delete this region/).click()
    return cy.findByRole('dialog').should('not.exist')
  }

  /**
   * Must be on the analysis page.
   */
  fetchAccessibilityComparison(
    coords: L.LatLngTuple,
    opportunityDataset?: OpportunityData
  ): Cypress.Chainable<[number, number]> {
    cy.setOrigin(coords)
    ;(opportunityDataset ?? this.defaultOpportunityDataset).select()

    cy.fetchResults()

    return cy
      .findByLabelText('Opportunities within isochrone')
      .itsNumericText()
      .then(
        (o): Cypress.Chainable<[number, number]> => {
          return cy
            .findByLabelText('Opportunities within comparison isochrone')
            .itsNumericText()
            .then((c): [number, number] => [o, c])
        }
      )
  }

  getBundle(
    name: string,
    gtfsFilePath: string,
    osmFilePath: string,
    serviceDate: string = scratchRegion.date
  ): Bundle {
    const bundle = new Bundle(name, serviceDate)

    // Store as default if there is none.
    if (!this.defaultBundle) this.defaultBundle = bundle

    before(`getBundle(${bundle.name})`, () => {
      this.navTo()

      // Check for the existing bundle. If it does not exist, create one.
      cy.navTo('network bundles')
      cy.findByLabelText(/or select an existing one/)
        .click({force: true})
        .type(bundle.name + '{enter}')
      cy.navComplete()
      cy.location('pathname').then((path) => {
        if (!path.match(/bundles\/\w{24}$/)) {
          // Does not exist, create the bundle
          cy.createBundle(bundle.name, gtfsFilePath, osmFilePath)
        }
      })
      cy.location('pathname')
        .should('match', /bundles\/\w{24}$/)
        .then((path) => {
          bundle.path = path
        })
      cy.navComplete()
    })

    return bundle
  }

  getProject(name: string, bundle?: Bundle): Project {
    bundle ??= this.defaultBundle
    const project = new Project(name, bundle)

    // Store as default if there is none.
    if (!this.defaultProject) this.defaultProject = project

    before(`getProject(${project.name})`, () => {
      this.navTo()

      // Create a project if it does not exist.
      cy.navTo('projects')
      cy.get('button').then((buttons) => {
        const pb = buttons.filter((_, el) => el.textContent === project.name)
        if (pb.length === 0) {
          cy.findByText(/Create new Project/i).click()
          cy.findByLabelText(/Project name/).type(project.name)
          cy.findByLabelText(/Associated network bundle/i)
            .click({force: true})
            .type(bundle.name + '{enter}')
          cy.findByText(/^Create$/).click()
        } else {
          cy.wrap(pb.first()).click()
        }

        // Store the project id
        cy.location('pathname')
          .should('match', /regions\/\w{24}\/projects\/\w{24}\/modifications$/)
          .then((path) => {
            project.path = path
          })
        cy.navComplete()
      })
    })

    return project
  }

  getOpportunityDataset(name: string, filePath: string): OpportunityData {
    const od = new OpportunityData(name)

    if (!this.defaultOpportunityDataset) this.defaultOpportunityDataset = od

    before(`getOpportunityDataset(${od.name})`, () => {
      this.navTo()

      // Check for the existing ods
      cy.navTo('opportunity datasets')
      cy.findByText(/Select\.\.\./)
        .click()
        .type(`${od.name} {enter}`)
      cy.navComplete()
      cy.location('href').then((href) => {
        if (!href.match(/.*DatasetId=\w{24}$/)) {
          cy.createOpportunityDataset(od.name, filePath)
        }
      })
      cy.location('href')
        .should('match', /.*DatasetId=\w{24}$/)
        .then((href) => {
          od.path = href
        })
      cy.navComplete()
    })

    return od
  }

  getRegionalAnalysis(name: string, options?: RegionalAnalysisOptions) {
    const ra = new RegionalAnalysis(name)

    before('getRegionalAnalysis', () => {
      this.navTo()
      cy.navTo('regional analyses')
      cy.findByText(/View a regional analysis/)
        .click()
        .type(`${ra.name}{enter}`)

      cy.location('href').then((href) => {
        if (!href.match(/analysisId=\w{24}/)) {
          this.setupAnalysis(options)

          cy.fetchResults()

          cy.createRegionalAnalysis(
            ra.name,
            options?.opportunityDatasets || [
              this.defaultOpportunityDataset.name
            ],
            options
          )
        }

        cy.location('href')
          .should('match', /.*analysisId=\w{24}$/)
          .then((href) => {
            ra.path = href
          })
        cy.navComplete()
      })
    })

    return ra
  }

  navTo(section?: Cypress.NavToOption) {
    cy.navComplete()
    cy.location('pathname', {log: false}).then((path) => {
      if (!path.startsWith(this.path)) {
        cy.visit(this.path)
        cy.navComplete()
      }

      if (section) {
        cy.navTo(section)
      }
    })
  }

  navToAnalysis() {
    cy.navComplete()
    cy.location('pathname', {log: false}).then((path) => {
      if (!path.startsWith(this.path + '/analysis')) {
        cy.visit(this.path + '/analysis')
        cy.navComplete()
      }
    })
  }

  /**
   * By default, compares the same project from
   * the default scenario to the baseline scenario.
   */
  setupAnalysis(
    primary?: ProjectAnalysisSettings,
    comparison?: ProjectAnalysisSettings
  ) {
    this.navToAnalysis()

    const project = primary?.project ?? this.defaultProject
    const projectName = project.name
    cy.getPrimaryAnalysisSettings().within(() => {
      cy.setProjectScenario(projectName, primary?.scenario ?? 'default')
      cy.patchAnalysisJSON({
        date: project.bundle.date,
        ...(primary?.settings ?? {})
      })
    })

    const comparisonProjectName = comparison?.project?.name ?? projectName
    const comparisonScenarioName = comparison?.scenario ?? 'baseline'
    cy.getComparisonAnalysisSettings().within(() => {
      cy.setProjectScenario(comparisonProjectName, comparisonScenarioName)
      if (comparison?.settings) {
        cy.findByLabelText('Identical request settings').uncheck({force: true})
        cy.patchAnalysisJSON(comparison.settings)
      }
    })
  }
}
