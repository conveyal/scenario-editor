import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import {createSelector} from 'reselect'

/**
 * Select all of the Opportunity Datasets for a region
 */
export const opportunityDatasets = createSelector(
  (state) => get(state, 'opportunityDatasets.datasets'),
  (datasets = []) => sortBy(datasets, ['sourceName', 'name'])
)

/**
 * Select the ID of the active dataset for a region
 */
export const activeOpportunityDatasetId = (state) =>
  get(state, 'opportunityDatasets.activeDataset')

/**
 * Select the active dataset for a region
 */
export const activeOpportunityDataset = createSelector(
  opportunityDatasets,
  activeOpportunityDatasetId,
  (datasets, _id) => datasets.find((d) => d._id === _id)
)

/**
 * Select the grid of an active dataset for a region
 */
export const activeOpportunityDatasetGrid = createSelector(
  activeOpportunityDataset,
  (dataset) => dataset && dataset.grid
)

/**
 * Get all of the dataset upload statuses
 */
export const uploadStatuses = (state) =>
  get(state, 'opportunityDatasets.uploadStatuses')
