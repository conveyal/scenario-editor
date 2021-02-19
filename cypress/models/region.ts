import {latLngBounds} from 'leaflet'
import {defaultAnalysisSettings, scratchRegion} from '../integration/utils'

import Bundle from './bundle'
import FreeformDataset from './freeform-dataset'
import Model from './model'
import SpatialDataset from './spatial-data'
import Project from './project'
import RegionalAnalysis, {RegionalAnalysisOptions} from './regional-analysis'
import {findDOMNode} from 'react-dom'

type ProjectAnalysisSettings = {
  project?: Project
  scenario?: string
  settings?: Record<string, unknown>
}

export default class Region extends Model {
  bounds: CL.Bounds
  center: L.LatLngTuple
  defaultBundle: Bundle
  defaultSpatialDataset: SpatialDataset
  defaultProject: Project

  constructor(name: string, bounds: CL.Bounds) {
    super('Conveyal', name, 'region')
    this.bounds = bounds
    const center = latLngBounds(
      [bounds.north, bounds.west],
      [bounds.south, bounds.east]
    ).getCenter()
    this.center = [center.lat, center.lng]
  }

  _delete() {
    cy.navTo('projects')
    cy.findButton(/Edit region settings/).click()
    // Delete region
    cy.findByText(/Delete this region/).click()
    cy.findByText(/Confirm: Delete this region/).click()
    cy.findByRole('dialog').should('not.exist')
  }

  /**
   * Must be on the analysis page.
   */
  fetchAccessibilityComparison(
    coords: L.LatLngTuple,
    spatialDataset?: SpatialDataset
  ): Cypress.Chainable<[number, number]> {
    cy.setOrigin(coords)
    ;(spatialDataset ?? this.defaultSpatialDataset).select()
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

  findOrCreate() {
    cy.visitHome()
    cy.get('button').then((buttons) => {
      const pb = buttons.filter((_, el) => el.textContent === this.name)
      if (pb.length === 0) {
        cy.findButton(/Set up a new region/).click()
        cy.findByLabelText(/Region Name/).type(this.name, {delay: 0})
        cy.findByLabelText(/North bound/)
          .clear()
          .type(this.bounds.north.toString(), {delay: 0})
        cy.findByLabelText(/South bound/)
          .clear()
          .type(this.bounds.south.toString(), {delay: 0})
        cy.findByLabelText(/West bound/)
          .clear()
          .type(this.bounds.west.toString(), {delay: 0})
        cy.findByLabelText(/East bound/)
          .clear()
          .type(this.bounds.east.toString(), {delay: 0})
        cy.findByRole('button', {name: /Set up a new region/}).click()
        cy.findByRole('button', {name: /Creating region/}).should('not.exist')
      } else {
        cy.wrap(pb.first()).click()
      }
      cy.location('pathname')
        .should('match', /regions\/\w{24}$/)
        .then((path) => {
          this.path = path
        })
      cy.navComplete()
    })
  }

  getBundle(
    name: string,
    gtfsFilePath: string,
    osmFilePath: string,
    serviceDate: string = scratchRegion.date
  ): Bundle {
    const bundle = new Bundle(
      this.key,
      name,
      serviceDate,
      gtfsFilePath,
      osmFilePath
    )

    // Store as default if there is none.
    if (!this.defaultBundle) this.defaultBundle = bundle

    before(`getBundle(${bundle.name})`, () => {
      this.navTo()
      bundle.initialize()
    })

    return bundle
  }

  getProject(name: string, bundle?: Bundle): Project {
    bundle ??= this.defaultBundle
    const project = new Project(this.key, name, bundle)

    // Store as default if there is none.
    if (!this.defaultProject) this.defaultProject = project

    before(`getProject(${project.name})`, () => {
      this.navTo()
      project.initialize()
    })

    return project
  }

  getFreeformDataset(name: string, filePath: string, idField?: string) {
    const fd = new FreeformDataset(this.key, name, filePath, idField)

    before(`getFreeformDataset(${fd.name})`, () => {
      this.navTo()
      fd.initialize()
    })

    return fd
  }

  getSpatialDataset(name: string, filePath: string): SpatialDataset {
    const od = new SpatialDataset(this.key, name, filePath)

    if (!this.defaultSpatialDataset) this.defaultSpatialDataset = od

    before(`getSpatialDataset(${od.name})`, () => {
      this.navTo()
      od.initialize()
    })

    return od
  }

  getRegionalAnalysis(name: string, options?: RegionalAnalysisOptions) {
    const ra = new RegionalAnalysis(
      this.key,
      name,
      options?.opportunityDatasets || [this.defaultSpatialDataset.name],
      options,
      this
    )

    before('getRegionalAnalysis', () => {
      this.navTo()
      ra.initialize()
    })

    return ra
  }

  /**
   * Navigate to a section of a region
   */
  navTo(section?: Cypress.NavToOption) {
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
   * Set default analysis settings.
   */
  initializeAnalysisDefaults() {
    this.navToAnalysis()
    this.setupAnalysis({
      project: this.defaultProject,
      settings: {
        ...defaultAnalysisSettings,
        bounds: this.bounds,
        date: this.defaultBundle.date
      }
    })
    cy.setOrigin(this.center)
    cy.fetchResults()
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
