.. _single_point_analysis:
# Single point analysis

The main analysis page is for generating :term:`isochrones<isochrone>` (travel time contours) from selected origins. To enter analysis mode, click the <i class="fa fa-area-chart"></i> icon on the sidebar. 

<figure>
  <img src="../img/analysis-default-settings.png" />
  <figcaption>The single-point analysis page with no projects or scenarios selected</figcaption>
</figure>

To start an analysis, you'll need to select a :term:`project` and :term:`scenario`. Once these are selected you can retrieve results for the origin marker shown on the map either by moving the marker to a new location or clicking the *fetch results* button at the top of the page. 

<span class="btn btn-info"><i class="fa fa-refresh"></i> Fetch results</span>

This will initialize a compute cluster which may take a minute to start up. 
If this is your first time performing an analysis with a given :term:`network bundle` it may take some time to build the network, however this only needs to be done once for each bundle. For more information, see :ref:`why_the_wait`

Once the compute cluster is initialized you should see an isochrone displayed in blue around your point on the map. If you have selected an opportunity dataset, you will also see a :ref:`accessibility_chart` at selected time and percentile thresholds. You may also select a comparison project and scenario, which will be shown in red.
Many other configuration parameters are described in :ref:`analysis_configuration`.

## Isochrone map

After the server returns results the map will show a blue :term:`isochrone` for your primary scenario. This represents the area reachable from the origin marker within a given travel time cutoff, to a given degree of certainty. If a comparison scenario is selected, its isochrone will be shown in red. The overlap of the main and comparison isochrones should be visible as a combination of the two colors.

<figure>
  <img src="../img/overlapping-isochrones.png" />
  <figcaption>Overlapping isochrones with a comparison scenario</figcaption>
</figure>

The *time cutoff* slider controls the travel time threshold between a range of one minute and two hours. The slider for *travel time percentile* controls the portion of departures within the time window that have to meet the travel time threshold. 
Reducing the travel time should smoothly decrease the size of the isochrone. 
The default values are 60 minutes, at the 50<sup>th</sup> percentile. This would mean that the default isochrone boundary is drawn where the median trip in the selected departure window would take exactly one hour. 
For single point analysis, percentile values are restricted to a preset range (5,25,50,75,95), so moving this slider will result in fairly discrete changes in the isochrone. An arbitrary percentile value can be set for a :ref:`regional_analysis`. 

<figure>
  <img src="../img/travel-time-slider.gif" />
  <figcaption>Testing different travel time cutoffs, percentiles, and origins</figcaption>
</figure>

The display of modifications on the map is controlled in editing mode (See: :ref:`toggle_mod_display`). To change what modifications are shown, you must set the visibility there and then navigate back to the analysis page. 

To change the origin of the analysis, drag the marker to a new location. Clicking on the map away from the marker will display a box and whisker plot of the distribution of travel times from the origin to that location. For example, in the image below the travel time varies between about 30 and 50 minutes depending on when one departs.

<figure>
  <img src="../img/destination-travel-time-distribution.png" />
  <figcaption>The travel time distribution from an origin to a destination</figcaption>
</figure>

## Analysis panel

The left panel has controls for the analysis and displays the access to opportunities afforded by the :term:`scenario`. At the top of the panel, available scenarios and opportunity data layers are listed in drop-down menus. For example, you might be interested in how a given scenario provides access to jobs, access to schools, or some other variable of interest represented in an :term:`opportunity dataset` you uploaded.
Additional scenarios can be selected for comparison. A :term:`baseline<baseline network>` scenario with no modifications (i.e. the unmodified :term:`network bundle` you uploaded) is automatically available for every project.

The options available in this panel are described more fully in :ref:`analysis_configuration`.

.. _accessibility_chart:
### Chart of accessibility results
If an :term:`opportunity dataset` is selected, the map will include a dot-density layer representing opportunities and you will be shown a chart of the accessibility (i.e. the number of opportunities reachable) from the chosen origin.

<figure>
  <img src="../img/analysis-stacked-percentile.png" />
  <figcaption>A stacked percentile plot</figcaption>
</figure>

The main display of accessibility results is the stacked percentile plot. The main plot shows the cumulative number of opportunities reachable at different travel time cutoffs. When transit schedules introduce variability, the graph will not be a single line because travel times (and consequently, accessibility) depend on when exactly a user of the transport system leaves their origin. In these cases, the graph shows the number of opportunities given 95<sup>th</sup>, 75<sup>th</sup>, 50<sup>th</sup>, 25<sup>th</sup>, and 5<sup>th</sup> percentile travel time. The bottom of the shaded area is the number of opportunities which are almost always reachable, while the top is the number of opportunities that are reachable only in the best cases (e.g. when someone leaves their house at the perfect time and has no waiting time, minimizing the overall travel time). The darkened line is the number of opportunities that are reachable at least half the time (i.e. have a median travel time of less than the travel time cutoff). For a more detailed explanation, see the [methodology](methodology.html) page.

When the cumulative plot is steep, areas with especially high opportunity densities (e.g. typical downtown areas for jobs) are reachable. Note that the Y axis is a square-root scale, so that the cumulative plot would be a straight line if both the opportunities and travel speeds radiating in all directions from an origin were uniform.

The currently-selected travel time cutoff is indicated by the vertical line on the plot.

To the left of the Y axis labels is a box-and-whisker plot. This shows the same information as the cumulative plot, but only for the currently selected travel time cutoff. The lowest whisker shows the number of opportunities accessible given 95<sup>th</sup> percentile travel time, the box shows the number of opportunities accessible given 75<sup>th</sup>, 50<sup>th</sup> and 25<sup>th</sup> percentile travel time, and the top whisker shows the number of opportunities reachable given 5<sup>th</sup> percentile travel time.

When a comparison scenario is selected two box plots will be displayed to the left of the axis with the comparison in red. The plots will also be simplified and only the bands between the 75<sup>th</sup> and 25<sup>th</sup> percentile travel times will be shown.

<figure>
  <img src="../img/stacked-percentile-comparison.png" />
  <figcaption>A stacked percentile plot comparing two scenarios. Note that the main scenario in blue has travel time variability while the comparison scenario in red (bicycle access only) has none.</figcaption>
</figure>

### Downloading

Click the download icon (<i class="fa fa-download"></i>) next to your main or comparison scenarios to download the results as a GeoJSON, GeoTIFF, or CSV. 

- **GeoJSON** saves the a multipolygon geometry of the isochrone currently shown on the map. The downloaded file can be converted to other formats using a tool like [mapshaper](http://mapshaper.org). Note that these vector isochrones are interpolations of the [underlying analysis grid](methodology.html#spatial-resolution).
- **GeoTIFF** saves the underlying travel time surface, a raster of travel times (in minutes) from the selected origin to the rest of the region. This raster has five bands corresponding to [time percentiles](methodology.html#time-percentile) of 5, 25, 50, 75, and 95. For geoprocessing, we often suggest using band 3 (the median travel time) of this raw output. Cells beyond the 120 minute cutoff are assigned a value of zero. 
- **CSV** saves a comma-separated table listing the total number of opportunities accessible at all combinations of time and percentile. It has one column for each minute between 1 to 120 and a row for each percentile (5,25,50,75,95).
