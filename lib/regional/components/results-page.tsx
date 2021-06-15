import {
  Alert,
  AlertIcon,
  Box,
  FormControl,
  FormLabel,
  Stack
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import dynamic from 'next/dynamic'
import {useCallback, useEffect} from 'react'

import AggregationAreaChart from 'lib/aggregation-area/components/chart'
import SelectAggregationArea from 'lib/aggregation-area/components/select'
import Select from 'lib/components/select'
import {useAggregationAreas} from 'lib/hooks/use-collection'
import useControlledInput from 'lib/hooks/use-controlled-input'
import {useShallowRouteTo} from 'lib/hooks/use-route-to'
import message from 'lib/message'

import DownloadMenu from './download-menu'
import RequestDisplay from './request'
import VariantSelectors from './variant-selectors'

import useDisplayGrid from '../hooks/use-display-grid'
import useDisplayScale from '../hooks/use-display-scale'
import useRegionalAnalysisGrid from '../hooks/use-regional-grid'
import useSpatialDatasetsInRegion from '../hooks/use-spatial-datasets'
import useSpatialDatasetGrid from '../hooks/use-spatial-dataset-grid'
import {getComparisonVariants, useVariant, variantIsCompatible} from '../utils'
import useComparisonAnalyses from '../hooks/use-comparison-analyses'

const AccessMap = dynamic(() => import('./access-map'), {ssr: false})
const Legend = dynamic(() => import('./legend'), {ssr: false})
const AggregationAreaOutline = dynamic(
  () => import('lib/aggregation-area/components/geojson-outline'),
  {ssr: false}
)

const getId = fpGet('_id')
const getName = fpGet('name')

/**
 * View an active or completed regional analysis.
 */
export default function ResultsPage({
  analysisVariant,
  jobs,
  query
}: {
  analysisVariant: CL.RegionalAnalysisVariant
  jobs: CL.RegionalJob[]
  query: CL.Query
}) {
  const {analysis} = analysisVariant
  const routeTo = useShallowRouteTo('regionalAnalysis')

  // Get valid comparison analyses
  const comparisonAnalyses = useComparisonAnalyses(analysis, jobs)

  const onChangeComparisonAnalysis = useCallback(
    (v?: CL.RegionalAnalysis) =>
      v == null
        ? routeTo({
            comparisonAnalysisId: null,
            comparisonCutoff: null,
            comparisonPercentile: null,
            comparisonPointSetId: null
          })
        : routeTo({
            comparisonAnalysisId: v._id,
            ...getComparisonVariants(v, query)
          }),
    [query, routeTo]
  )
  const comparisonAnalysisInput = useControlledInput({
    onChange: onChangeComparisonAnalysis,
    value: comparisonAnalyses.find((a) => a._id === query.comparisonAnalysisId)
  })
  const comparisonAnalysis = comparisonAnalysisInput.value

  // Construct the parsed query objects
  const comparisonVariant: CL.RegionalAnalysisVariant = useVariant(
    comparisonAnalysis,
    parseInt(query.comparisonCutoff, 10),
    parseInt(query.comparisonPercentile, 10),
    query.comparisonPointSetId
  )

  // Redirect to a valid comparison variant if one has not been selected.
  useEffect(() => {
    if (
      comparisonVariant.analysis != null &&
      !variantIsCompatible(comparisonVariant)
    ) {
      routeTo({
        comparisonAnalysisId: comparisonVariant.analysis._id,
        ...getComparisonVariants(comparisonVariant.analysis, query)
      })
    }
  }, [comparisonVariant, query, routeTo])

  const grid = useRegionalAnalysisGrid(analysisVariant)
  const comparisonGrid = useRegionalAnalysisGrid(comparisonVariant)
  const displayGrid = useDisplayGrid(grid, comparisonGrid)
  const displayScale = useDisplayScale(displayGrid)
  const {data: aggregationAreas} = useAggregationAreas({
    query: {regionId: analysis.regionId}
  })
  const activeAggregationArea = aggregationAreas.find(
    (a) => a._id === query.aggregationAreaId
  )
  const spatialDatasets = useSpatialDatasetsInRegion(analysis.regionId)
  const sdName = (id: string) => spatialDatasets.find((s) => s._id === id)?.name
  const weightsGrid = useSpatialDatasetGrid(query.weightsGridId)

  /**
   * Should we display results?
   * When an originPointSetKey is set, we cannot display the map in the application and can only offer the
   * ability to download the data that has been created for manual inspection.
   */
  const displayResults = analysis.request?.originPointSetKey == null

  return (
    <>
      <Stack p={4} shouldWrapChildren>
        <VariantSelectors
          analysisVariant={analysisVariant}
          onChangeCutoff={(v) => routeTo({cutoff: v})}
          onChangePercentile={(v) => routeTo({percentile: v})}
          onChangePointSet={(v) => routeTo({pointSetId: v})}
        />

        <DownloadMenu analysisVariant={analysisVariant} />
      </Stack>

      <RequestDisplay analysis={analysis} />

      {displayResults && (
        <>
          <AccessMap grid={displayGrid} displayScale={displayScale} />

          <Legend
            analysisVariant={analysisVariant}
            comparisonVariant={comparisonVariant}
            displayGrid={displayGrid}
            displayScale={displayScale}
            spatialDatasets={spatialDatasets}
          />

          <FormControl px={4} pt={4}>
            <FormLabel htmlFor={comparisonAnalysisInput.id}>
              {message('analysis.compareTo')}
            </FormLabel>
            <Select
              inputId={comparisonAnalysisInput.id}
              isClearable
              getOptionLabel={getName}
              getOptionValue={getId}
              onChange={comparisonAnalysisInput.onChange}
              options={comparisonAnalyses}
              value={comparisonAnalysis}
            />
          </FormControl>

          {comparisonAnalysis && (
            <>
              {analysis.workerVersion !== comparisonAnalysis.workerVersion && (
                <Alert status='error' pt={2}>
                  <AlertIcon />
                  {message('r5Version.comparisonIsDifferent')}
                </Alert>
              )}

              <Box px={4} pt={2} pb={4}>
                <VariantSelectors
                  analysisVariant={comparisonVariant}
                  onChangeCutoff={(v) => routeTo({comparisonCutoff: v})}
                  onChangePercentile={(v) => routeTo({comparisonPercentile: v})}
                  onChangePointSet={(v) => routeTo({comparisonPointSetId: v})}
                />
              </Box>

              <RequestDisplay analysis={comparisonAnalysis} color='red' />
            </>
          )}

          <SelectAggregationArea
            activeAggregationArea={activeAggregationArea}
            aggregationAreas={aggregationAreas}
          />

          {activeAggregationArea && (
            <>
              <AggregationAreaOutline aggregationArea={activeAggregationArea} />

              <FormControl px={4}>
                <FormLabel>{message('analysis.weightBy')}</FormLabel>
                <Select
                  getOptionLabel={getName}
                  getOptionValue={getId}
                  onChange={(v: CL.SpatialDataset) =>
                    routeTo({weightsGridId: v._id})
                  }
                  options={spatialDatasets}
                  value={spatialDatasets.find(
                    (sd) => sd._id === query.weightsGridId
                  )}
                />
              </FormControl>

              {weightsGrid && (
                <AggregationAreaChart
                  aggregationArea={activeAggregationArea}
                  accessToName={sdName(analysisVariant.pointSetId)}
                  comparisonAccessToName={sdName(comparisonVariant?.pointSetId)}
                  comparisonGrid={comparisonGrid}
                  comparisonRegionalAnalysisName={comparisonAnalysis?.name}
                  grid={grid}
                  regionalAnalysisName={analysis.name}
                  weights={weightsGrid}
                  weightByName={sdName(query.weightsGridId)}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
