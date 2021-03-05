import SpatialDataset from './spatial-data'

export default class FreeformDataset extends SpatialDataset {
  idField: string

  constructor(
    parentName: string,
    name: string,
    filePath: string,
    idField = 'id'
  ) {
    super(parentName, name, filePath)
    this.idField = idField
  }

  _create() {
    cy.createOpportunityDataset(this.name, this.filePath, true, this.idField)
  }
}
