/// <reference types="cypress" />
/// <reference types="leaflet" />

declare namespace Cypress {
  // Entity names must be camel cased. They are used to reference JSON keys
  export type Entity =
    | 'analysis'
    | 'bundle'
    | 'opportunities'
    | 'project'
    | 'region'
    | 'regionalAnalysis'

  export type ModificationType =
    | 'Add Streets'
    | 'Add Trip Pattern'
    | 'Adjust Dwell Time'
    | 'Adjust Speed'
    | 'Convert To Frequency'
    | 'Modify Streets'
    | 'Remove Stops'
    | 'Remove Trips'
    | 'Reroute'
    | 'Custom'

  export type NavToOption =
    | 'analyze'
    | 'edit modifications'
    | 'network bundles'
    | 'opportunity datasets'
    | 'projects'
    | 'regions'
    | 'regional analyses'
    | 'region settings'

  export type ProjectScenario = {
    project?: string
    scenario?: string
    settings?: Record<string, unknown>
  }

  // eslint-disable-next-line
  interface Chainable {
    /**
     * Center the map on the given coordinates.
     * @example cy.centerMapOn([60, 25])
     */
    centerMapOn(coord: L.LatLngTuple, zoom?: number): Chainable<L.Map>

    /**
     * Pan to the coordinate and click that point on the map.
     */
    clickMapAtCoord(coord: L.LatLngTuple, zoom?: number): Chainable<void>

    /**
     * Create a modification.
     * @example cy.createModification('Add Trip Pattern', 'New name')
     */
    createModification(type: ModificationType, name: string): Chainable<void>

    /**
     * Create a region. Returns the new region id.
     * @example cy.createRegion('Region', bounds)
     */
    createRegion(name: string, bounds: CL.Bounds): Chainable<string>

    /**
     * Create a bundle
     */
    createBundle(
      name: string,
      gtfsFilePath: string,
      pbfFilePath: string
    ): Chainable<string>

    /**
     * Create a new opportunity dataset.
     * @param name
     * @param filePath
     */
    createOpportunityDataset(name: string, filePath: string): Chainable<string>

    /**
     * Create a new regional analysis.
     * @example cy.createRegionalAnalysis('New RA', ['default'])
     */
    createRegionalAnalysis(
      name: string,
      opportunityDatasets: string[],
      settings?: {
        cutoffs?: number[]
        percentiles?: number[]
        timeout?: number
      }
    ): Chainable<string>

    /**
     * Delete a modification by type and name.
     */
    deleteModification(name: string): Chainable<void>

    /**
     * Delete an open modification.
     */
    deleteThisModification(): Chainable<void>

    /**
     * Draw route geometry on an open modification
     * @example cy.drawRouteGeometry([[50, -70], [51, -71]])
     */
    drawRouteGeometry(coords: L.LatLngTuple[]): Chainable<void>

    /**
     * Set custom analysis value.
     * @example cy.editPrimaryAnalysisJSON('fromLat', 51)
     */
    editPrimaryAnalysisJSON(key: string, newValue: any): Chainable<void>

    /**
     * Edit modification JSON directly.
     */
    editModificationJSON(newValues: Record<string, unknown>): Chainable<void>

    /**
     * While in the analysis page, fetch and wait for results.
     * @example cy.fetchResults()
     */
    fetchResults(): Chainable<void>

    /**
     * Get the LeafletMap.
     * @example cy.getLeafletMap().then(map => {...})
     */
    getLeafletMap(): Chainable<L.Map>

    /**
     *
     * @param entity
     */
    getMapDiv(): Chainable<HTMLElement>

    /**
     * Get the analysis settings section for primary/comparison.
     */
    getPrimaryAnalysisSettings(): Chainable<JQuery<HTMLDivElement>>
    getComparisonAnalysisSettings(): Chainable<JQuery<HTMLDivElement>>

    /**
     * Check if the values are within a tolerance of each other
     * @example cy.get('#input').itsNumericValue().isWithin(7, 1)
     */
    isWithin(comparison: number, tolerance?: number): Chainable<boolean>

    /**
     * Get the numeric value of an input.
     * @example cy.get('#input').itsNumericValue().should('be', 12)
     */
    itsNumericValue(): Chainable<number>

    /**
     * Get the text as a numberic value.
     * @example cy.findByText('Opportunities).itsNumericText().should('be', 18200)
     */
    itsNumericText(): Chainable<number>

    /**
     * Wait until the spinner is gone and loading is complete.
     */
    loadingComplete(): Chainable<boolean>

    /**
     * Check if the map is centered on a set of coordinates.
     * @example cy.mapCenteredOn([50.5, 121.2], 5)
     */
    mapCenteredOn(latlng: L.LatLngTuple, tolerance: number): Chainable<boolean>

    /**
     * Navigate to a page via the sidebar.
     * @example cy.navTo('projects')
     */
    navTo(location: NavToOption): Chainable<boolean>

    /**
     * Wait until a manual navigation is complete.
     * @example cy.navComplete()
     */
    navComplete(): Chainable<boolean>

    /**
     * Open an existing modification.
     * @example cy.openModification('New name')
     */
    openModification(name: string): Chainable<void>

    /**
     * Merge new values into the existing analysis JSON. Must be done chained from or
     * `within` one of the two analysis sections.
     * @example cy.get('#Primary').patchAnalysisJSON({fromLat: 50})
     */
    patchAnalysisJSON(
      newValues: Record<string, unknown>
    ): Chainable<HTMLElement>

    /**
     * Select the default dataset.
     */
    selectDefaultOpportunityDataset(): Chainable<void>

    /**
     * Select modification feed and route by name
     */
    selectFeed(feedName: string): Chainable<void>
    selectRoute(routeName: string): Chainable<void>
    selectDefaultFeedAndRoute(): Chainable<void>

    /**
     * Set the analysis origin.
     * @example cy.setOrigin([lat, lng])
     */
    setOrigin(latlng: L.LatLngTuple): Chainable<void>

    /**
     * Set the project/scenario. Must be chained off a specific settings.
     * @example cy.getPrimaryAnalysisSettings().setProjectScenario('project')
     */
    setProjectScenario(
      project: string,
      scenario?: string
    ): Chainable<HTMLElement>

    /**
     * Set the time cutoff.
     * @example cy.setTimeCutoff(120)
     */
    setTimeCutoff(cutoff: number): Chainable<void>

    /**
     * Wait for the map to be ready for interactivity
     * @example cy.waitForMapToLoad()
     */
    waitForMapToLoad(): Chainable<L.Map>

    /**
     * Go to home page and wait for it to load.
     */
    visitHome(): Chainable<void>
  }
}
