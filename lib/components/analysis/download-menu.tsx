import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuButtonProps
} from '@chakra-ui/react'
import get from 'lodash/get'
import snakeCase from 'lodash/snakeCase'
import {memo} from 'react'
import {useDispatch, useSelector, useStore} from 'react-redux'

import {fetchGeoTIFF} from 'lib/actions/analysis'
import {DownloadIcon} from 'lib/components/icons'
import selectComparisonIsochrone from 'lib/selectors/comparison-isochrone'
import selectComparisonPercentileCurves from 'lib/selectors/comparison-percentile-curves'
import selectIsochrone from 'lib/selectors/isochrone'
import selectPercentileCurves from 'lib/selectors/percentile-curves'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import downloadCSV from 'lib/utils/download-csv'
import downloadJson from 'lib/utils/download-json'

const getIsochrone = (state, isComparison: boolean) =>
  isComparison ? selectComparisonIsochrone(state) : selectIsochrone(state)

const getRequestSettings = (state, isComparison: boolean) =>
  get(state, `analysis.requestsSettings[${isComparison ? 1 : 0}]`)

const getPercentileCurves = (state, isComparison: boolean) =>
  isComparison
    ? selectComparisonPercentileCurves(state)
    : selectPercentileCurves(state)

type DownloadMenuProps = MenuButtonProps & {
  isComparison?: boolean
  isDisabled?: boolean
  opportunityDataset: CL.SpatialDataset
  projectId: string
  projectName: string
  variantIndex: number
}

const DownloadMenu = memo<DownloadMenuProps>(
  ({
    isComparison = false,
    opportunityDataset,
    projectId,
    projectName,
    variantIndex,
    ...p
  }) => {
    const dispatch = useDispatch()
    const cutoff = useSelector(selectMaxTripDurationMinutes)
    const store = useStore()

    function downloadIsochrone() {
      downloadJson({
        data: {
          ...getIsochrone(store.getState(), isComparison),
          properties: {} // TODO set this in jsolines
        },
        filename:
          snakeCase(`conveyal isochrone ${projectName} at ${cutoff} minutes`) +
          '.json'
      })
    }

    function downloadOpportunitiesCSV() {
      const header =
        Array(121)
          .fill(0)
          .map((_, i) => i)
          .join(',') + '\n'
      const csvContent = getPercentileCurves(store.getState(), isComparison)
        .map((row) => row.join(','))
        .join('\n')
      const name = snakeCase(
        `Conveyal ${projectName} percentile access to ${get(
          opportunityDataset,
          'name'
        )}`
      )
      downloadCSV(header + csvContent, name)
    }

    // TODO don't dispatch an action, just fetch and show the button in a loading state
    function onClickDownloadGeoTIFF() {
      const requestsSettings = getRequestSettings(
        store.getState(),
        isComparison
      )
      return dispatch(
        fetchGeoTIFF(projectName, {
          projectId,
          variantIndex,
          ...requestsSettings
        })
      )
    }

    return (
      <Menu isLazy>
        <MenuButton as={Button} {...p}>
          <DownloadIcon />
        </MenuButton>
        <MenuList>
          <MenuItem onClick={downloadIsochrone}>Isochrone as GeoJSON</MenuItem>
          <MenuItem onClick={onClickDownloadGeoTIFF}>
            Isochrone as GeoTIFF
          </MenuItem>
          <MenuItem
            isDisabled={!opportunityDataset}
            onClick={downloadOpportunitiesCSV}
            title={
              opportunityDataset ? '' : 'Opportunity dataset must be selected'
            }
          >
            Access to opportunities as CSV
          </MenuItem>
        </MenuList>
      </Menu>
    )
  }
)

export default DownloadMenu
