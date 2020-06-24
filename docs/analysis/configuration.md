.. _analysis_configuration:
# Options and configuration

Below the accessibility charts, different parameters for the analysis can be set:

<figure>
  <img src="../static/img/analysis-settings.png" />
  <figcaption>The analysis settings pane</figcaption>
</figure>

## Travel time and variability

The **Travel time cutoff** sets the maximum door-to-door travel time for the [isochrone](../glossary.md#isochrone) on the map and accessibility indicators.
There may be variability in travel times, depending on when exactly in a specified time window someone starts their trip. The **Travel time percentile** sets which percentile of the distribution of total travel times to use. Low percentiles correspond to travelers having the information and flexibility to start trips at times that minimize their overall travel time. For more information, see [methodology](methodology.html#time-percentile). In single-point analyses the travel time percentile is rounded to one of five pre-defined values (5, 25, 50, 75, and 95).

## Bookmarks

The first panel allows the creation and use of **bookmarks**, which store particular analysis settings (e.g. origin location, type of opportunity, departure date and time, travel time cutoff, etc.). Once you have the settings the way you want to save them, you can click the grean *Create* button to create a new bookmark. Once created, you can select a bookmark from the dropdown box to automatically fill in all of the settings saved in that bookmark. Bookmarks are shared by all projects in a region.

## Access, transit, and egress modes

The three mode settings control what transport modes can be used for travel on the network. Routing can be done using multiple modes, either with or without transit. 

The **access/direct mode** controls what mode may be used for the first or only leg of a journey. If any transit modes are enabled, the selected access mode will be used (up to a maximum time, as described below) to travel from the origin to nearby transit stops, or to access the destination directly if that is faster than using transit. If no transit modes are enabled, the selected mode will be used to travel directly to destinations.

.. note::
   Traffic congestion is not taken into account in driving time estimates, though this may be a feature of a future release when more detailed datasets are available.

If one or more of the **transit modes** are enabled, the router will consider journeys using the selected transit modes and will add the option of an egress mode. The default is to use all transit modes, though you may change this for example to examine only a subcomponent of your transit network or to model strong user preferences regarding mode. 

With transit enabled, you will also have to select an **egress mode**, which controls the mode used on the final leg or "last mile" of the trip involving transit. 
The default egress mode is walking and cycling egress modes may require some extra initial computation time; contact your support team if you need assistance.

Modes can be combined in many different ways, for example:
* `drive` -> `commuter rail` -> `walk` could be used to simulate suburban drop-off to downtown commute patterns or
* `bike` -> `all transit` -> `bike` could simulate a personal bike on one end of a trip connecting to a bikeshare system on the other
* *etc.*

## Date and departure window 

Next are the **date**, **from time**, and **to time**, which define the time period analyzed (i.e. the opportunities accesible by someone leaving the chosen origin point on the chosen date between the chosen times). The first time you open a project, these will default to the current date and 7:00 to 9:00. To avoid inadvertently introducing differences in results due to differences in service on different days, we recommend choosing a single date and using it throughout a project. You should check that the date chosen is representative in the GTFS feeds you are using (e.g. a non-holiday weekday).

## Walking speed and distance 

**Walk speed**, **Bike speed**, **Max walk time**, and **Max bike time** apply to each access, transfer, and egress leg of trips when public transport is enabled. Any requested values will be applied for access and direct (walk- or bike-only) legs. For transfer and egress legs, the requested values will be applied, up to a distance limit of 2 km for walk and 5 km for bicycle. The default value for Max walk time allows trips requiring a 20 minute walk to initial boarding stops, 20 minute walks at each transfer, and a 20 minute walk from alighting stops to final destinations; it also allows trips requiring a 20 minute walk from origin to destination, when walking directly is faster than using public transport.

In certain cases, these limits may lead to counterintuitive results. For example, consider a destination that is about a 30-minute walk north of a given origin; an east-west bus route 15 minutes north of the origin would let travelers "circumvent" a 20-minute max walk time by walking 15 minutes to the bus, riding one stop, then walking 15 minutes to the destination.

When public transport is disabled, these limits are not applied and the travel time slider below the accessibility chart effectively controls the maximum time for the requested direct mode.

## Transfers

**Maximum transfers** is an upper limit on the number of transfers that will be considered when finding optimal trips.

## Simulated schedules

If your scenario includes frequency-based routes (either in the baseline GTFS or in modifications with [exact times](../edit-scenario/timetable.html#exact-times) not selected), **simulated schedules** controls the number of schedules simulated for sampling. The sampling process introduces random uncertainty so you may see results change slightly between repeated requests. When comparing regional analyses that include frequency-based routes, you may see small unexpected increases or decreases attributable to this random noise. Final results will be more accurate when **simulated schedules** is set to higher values, though computation will take longer. For quick, interactive analysis we recommend setting it to 200, whereas for final analysis we recommend setting it to 1000. For more information, see [methodology](methodology.html).

If your scenario does not include frequency-based routes there is no need to simulate schedules so the requested number of simulated schedules is ignored. In other words, when departure times are explicitly specified for all trips in a scenario, only that single fully specified set of exact departure/arrival times needs to be tested, which speeds computation and eliminates random noise from sampling.

## Routing engine

The **Routing engine** version will default to the highest available version of [Conveyal R5](https://github.com/conveyal/r5), or to the version previously used for the selected project. If you use a routing engine version with the first or second number of the version changed, there may be changes to the algorithm that affect results. Previous versions used for regional analysis in a given region will be available in this drop-down menu. You can change versions manually by typing any supported release version (e.g. "v4.8.0") in the routing engine field.

In general the default setting should be fine unless you are advised otherwise by your support team. 

## Errors and warnings

Occasionally analysis will fail because there is a problem with one of your modifications. When this occurs, error messages will be displayed detailing the issues as shown below. Simply return to the modification editor and correct the errors in the relevant modifications. 

<figure>
  <img src="../static/img/modification-error.png" />
  <figcaption>Error displayed for a modification</figcaption>
</figure>

In other cases, the scenario may generate a warning, for instance if you remove more time from a segment when speeding it up than the length of that segment. This is not necessarily an error but may require attention.

<figure>
  <img src="../static/img/scenario-warning.png" />
  <figcaption>Warnings displayed for a modification</figcaption>
</figure>
