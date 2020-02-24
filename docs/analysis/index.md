.. _single_point_analysis:
# Single point analysis

The main analysis page is for generating :term:`isochrones<isochrone>` (travel time contours) from selected origins. To enter analysis mode, click the <i class="fa fa-area-chart"></i> icon on the sidebar. To start an analysis, ensure a :term:`project` and :term:`scenario` are selected. 

To retrieve results for the origin marker shown on the map, you can either move the marker to a new location or click the *fetch results* button at the top. 

<br><span class="btn btn-info"><i class="fa fa-refresh"></i> Fetch results</span>

This will initialize a compute cluster which may take a minute to start up. 
If this is your first time performing an analysis with a given :term:`bundle<gtfs bundle>`, it may take some time to build the network. This only needs to be done once for each bundle. 
For more information, see :ref:`why_the_wait`

Once the compute cluster is initialized, you should see an isochrone displayed in blue around your point on the map. If you have selected an opportunity dataset, you will also see a chart showing cumulative accessibility results at selected time and percentile thresholds. You may also select a comparison project and scenario, which will be shown in red. 
Many other configuration parameters are described in :ref:`analysis_configuration`.

## Isochrone map

After the server returns results, the map will show a blue :term:`isochrone`. 
This represents the area reachable from the origin marker within a given travel time cutoff, to a given degree of certainty. 

The *time cutoff* slider controls the travel time threshold between a range of one minute and two hours. The slider for *travel time percentile* controls the portion of departures within the time window that have to meet the travel time threshold. 
Reducing the travel time should smoothly decrease the size of the isochrone, as would increasing the travel time percentile. 
The default values are 60 minutes and 50th percentile. This would mean that the default isochrone boundary is drawn where exactly half of trips in the selected departure window would take exactly one hour. 

The modifications displayed on the map are controlled in editing mode (See: :ref:`toggle_mod_display`).

To change the origin of the analysis, drag the marker to a new location. Clicking on the map will display a box and whisker plot of the distribution of travel times from the origin to that location. For example, in the image below, the travel time varies between about 30 and 50 minutes depending on when one departs.

<figure>
  <img src="../img/destination-travel-time-distribution.png" />
  <figcaption>The travel time distribution from an origin to a destination, with ticks at the following percentiles: 5,25,50,75,95</figcaption>
</figure>

If multiple scenarios are being compared, the isochrone for the first scenario remains blue while the isochrone for the second is red. Thus, areas reachable under both scenarios are purple, areas reachable only under the first scenario are blue, and areas reachable only under the second scenario are red.

<figure>
  <img src="../img/seattle-isos.gif" />
  <figcaption>Testing different scenarios, travel time cutoffs, and origins</figcaption>
</figure>

If an [opportunity dataset](../prepare-inputs/upload-opportunity-data.html) is selected in the drop-down menu in the settings panel, the map will show gray dots representing the density of opportunities. For instance, if your selected opportunity data are jobs, there will be tightly packed dots in areas of dense employment, and less tightly packed dots elsewhere. One dot represents one or multiple opportunities, and the scale may differ between zoom levels and opportunity datasets. For example, if at a given zoom level, one dot represents 4 jobs, at that same zoom level one dot might represent only two residents.

## Analysis panel

The left panel has controls for the analysis and displays the access to opportunities afforded by the :term:`scenario`. At the top of the panel, available scenarios and opportunity data layers are listed in drop-down menus. For example, you might be interested in how a given scenario provides access to jobs, access to schools, or some other variable of interest represented in an :term:`opportunity dataset` you uploaded.
Additional scenarios can be selected for comparison. A :term:`baseline<baseline network>` scenario with no modifications (i.e. the unmodified :term:`GTFS bundle` you uploaded) is automatically available for every project.

### Charts of accessibility results

Directly below the comparison controls are readouts of the accessibility (number of opportunities reachable) from the chosen origin under the scenario and (if applicable) any comparison scenario.

<figure>
  <img src="../img/analysis-stacked-percentile.png" />
  <figcaption>A stacked percentile plot</figcaption>
</figure>

The main display of accessibility results is the stacked percentile plot. The right portion of the plot shows the distribution of cumulative accessibility, i.e. the number of opportunities reachable given varying travel time cutoffs. The graph is not a single line, because there is variation in transit travel time depending on when a user of the transport system leaves their origin. Rather, the graph shows the number of opportunities given 95th, 75th, 50th, 25th, and 5th percentile travel time. The bottom of the shaded area is the number of opportunities which are almost always reachable, while the top is the number of opportunities that are reachable only in the best cases (e.g. when someone leaves their house at the perfect time and has no waiting time). The darkened line is the number of opportunities that are reachable at least half the time (i.e. have a median travel time of less than the travel time cutoff). For a more detailed explanation, see the [methodology](methodology.html) page.

The currently-selected travel time cutoff is indicated by the vertical line on the plot.

To the left of the Y axis labels is a box-and-whisker plot. This shows the same information as the cumulative plot, but only for the currently selected travel time cutoff. The lowest whisker shows the number of opportunities accessible given 95th percentile travel time, the box shows the number of opportunities accessible given 75th, 50th and 25th percentile travel time, and the top whisker shows the number of opportunities reachable given 5th percentile travel time.

When multiple scenarios are selected, the charts will be slightly different, because they will include information for both scenarios.

Two box plots will be displayed, in red and blue, to the left of the axis. The blue box plot is for the first scenario, while the red one is for the second scenario. Above the chart, there is a selector that allows you to select whether to view the cumulative curves for the first scenario, the second scenario, or both (in which case the plots will be simplified and only the bands between the 75th and 25th percentile travel times will be shown, for simplicity).

<figure>
  <img src="../img/stacked-percentile-comparison.png" />
  <figcaption>A stacked percentile plot comparing two scenarios</figcaption>
</figure>

### Downloading

There are multiple options for downloading single-point analyses:

- <span class="btn btn-info"><i class="fa fa-download"></i> Isochrone as GeoJSON</span> saves the isochrone currently shown on the map. The downloaded file can be converted to other formats using a tool like [mapshaper](http://mapshaper.org). Note that these vector isochrones are interpolations of the [underlying analysis grid](methodology.html#spatial-resolution). They can be useful for visualizing results in GIS, but additional steps may be needed to prepare them for geoprocessing.
- <span class="btn btn-info"><i class="fa fa-globe"></i> Generate & Download GeoTIFFs</span> saves the underlying travel time surface, a raster of travel times (in minutes) from the selected origin to the rest of the region. This raster has five bands corresponding to [time percentiles](methodology.html#time-percentile) of 5, 25, 50, 75, and 95. For geoprocessing, we often suggest using band 3 (the 50th percentile travel times) of this raw output.
