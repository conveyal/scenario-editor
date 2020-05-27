.. _analysis_configuration:
# Options and configuration

Below the accessibility charts, different parameters for the analysis can be set:

<figure>
  <img src="../img/analysis-settings.png" />
  <figcaption>The analysis settings pane</figcaption>
</figure>

The first panel allows the creation and use of **bookmarks**, which store particular analysis settings (e.g. origin location, type of opportunity, departure date and time, travel time cutoff, etc.). Once you have a set of settings you would like save, click <span class="btn btn-success"><i class="fa fa-plus"></i> Create bookmark</span>. Once that is done, you can select a bookmark from the dropdown box to automatically fill in all of the settings from that bookmark. Bookmarks are shared by all projects in a region.

Next are selectors for **access modes** and **transit modes**; you can choose to perform your analysis with or without transit, and using walking, biking or driving. For instance, in the image above, a combination of walking and transit has been chosen. Note that traffic congestion is not taken into account in driving time estimates, though this may be a feature of a future release when more detailed datasets are available.

Next are the **date**, **from time**, and **to time**, which define the time period analyzed (i.e. the opportunities accesible by someone leaving the chosen origin point on the chosen date between the chosen times). The first time you open a project, these will default to the current date and 7:00 to 9:00. To avoid inadvertently introducing differences in results due to differences in service on different days, we recommend choosing a single date and using it for the duration of a project. You should check that the date chosen is sufficiently representative in the GTFS feeds you are using (e.g. a non-holiday weekday).

You will also need to select a **Routing engine** version, which should default to the highest available version of [Conveyal R5](https://github.com/conveyal/r5).

The final option is the **Percentile of travel time**. In single-point analyses, this is rounded to one of five pre-defined values (5, 25, 50, 75, and 95). For more information, see [methodology](methodology.html#time-percentile).

## Advanced settings

**Maximum transfers** is an upper limit on the number of transfers that will be considered when finding optimal trips.

**Egress mode** defaults to walking. Non-walk egress modes may require a lengthy initial computation step; contact your support team if you need assistance.

**Walk speed**, **Bike speed**, **Max walk time**, and **Max bike time** apply to each access, transfer, and egress leg of trips when public transport is enabled. Any requested values will be applied for access and direct (walk- or bike-only) legs. For transfer and egress legs, the requested values will be applied, up to a distance limit of 2 km for walk and 5 km for bicycle. At reasonable speeds, the default value for Max walk time allows trips requiring a 20 minute walk to initial boarding stops, 20 minute walks at each transfer, and a 20 minute walk from alighting stops to final destinations; it also allows trips requiring a 20 minute walk from origin to destination, when walking directly is faster than using public transport.

In certain cases, these limits may lead to counterintuitive results. For example, consider a destination that is about a 30-minute walk north of a given origin; an east-west bus route 15 minutes north of the origin would let travelers "circumvent" a 20-minute max walk time by walking 15 minutes to the bus, riding one stop, then walking 15 minutes to the destination.

When public transport is disabled, these limits are not applied and the travel time slider below the accessibility chart effectively controls the maximum time for the requested direct mode.

If your scenario includes frequency-based routes (either in the baseline GTFS or in modifications with [exact times](../edit-scenario/timetable.html#exact-times) not selected), **simulated schedules** controls the number of schedules simulated for sampling. The sampling process introduces random uncertainty, so you may see results change slightly when you repeatedly request accessibility results. When comparing regional analyses that include frequency-based routes, you may see small unexpected increases or decreases attributable to this random noise. Final results will be more accurate when **simulated schedules** is set to higher values, but computation will take longer. For quick, interactive analysis, we recommend setting it to 200, whereas, for final analysis, we recommend setting it to 1000. For more information, see [methodology](methodology.html).

If your scenario does not include frequency-based routes, there is no need to simulate schedules, so the requested number of simulated schedules is ignored. In other words, when departure times are explicitly specified for all trips in a scenario, only that single fully specified set of exact departure/arrival times needs to be tested, which speeds computation and eliminates random noise from sampling.

## Errors and warnings

Occasionally, analysis will fail because there is an error in a scenario. When this occurs, error messages will be displayed detailing the issues, as shown below. One simply needs to return to the modification editor and correct the errors in the relevant modifications.

In other cases, the scenario may generate a warning, for instance if you remove more time from a segment when speeding it up than the length of that segment. This is not necessarily an error, but may require attention.

<figure>
  <img src="../img/scenario-warning.png" />
  <figcaption>Scenario warnings displayed in the editor</figcaption>
</figure>
