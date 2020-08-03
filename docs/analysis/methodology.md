# Methodology

This is a summary of the accessibility indicators used in Conveyal Analysis. For more details, please see Conway, Matthew Wigginton, Andrew Byrd, and Marco van der Linden (2017). “[Evidence-Based Transit and Land Use Sketch Planning Using Interactive Accessibility Methods on Combined Schedule and Headway-Based Networks](https://repository.asu.edu/attachments/218654/content/TRB%2017-06602%20TRR%20manuscript%20preprint.pdf)”

##Spatial resolution
<a name="spatial-grid"/>

As a shared geographic foundation for regions, opportunity datasets, and accessibility indicators, Conveyal Analysis uses a regular grid of cells. Each cell measures approximately 300 meters by 300 meters, depending on the latitude (with larger cells at the equator and smaller cells near the poles). These grid cells are not spaced at a round number of meters. Instead they are one-unit steps in the same global projection used for map display in our web interface. This helps accelerate map display, while eliminating the complexity of switching to different local projections. Large regions may contain more than a million such cells, reflecting a much finer resolution than typical regional travel demand models. Conveyal implemented this approach to counter the effects of the "modifiable areal unit problem" and in response to systematic bias we observed when using the center points of polygons defined by roads, we have made an intentional methodological choice to perform all measurement on regular grids whose geometry is independent of roads and land parcels.

Opportunity datasets from uploaded point or polygon files, as well as LODES imports, are resampled into this standardized regular grid. For example, if a large traffic analysis zone in an uploaded shapefile has 10 thousand jobs, those jobs are dispersed throughout the grid cells intersecting that zone, according to the areal proportion of the intersection of each cell with the zone.

##Accounting for variability

Travel times by transit are often highly variable, depending on when travelers start their journeys and the timetables of routes they use. To account for this variability, we calculate the distribution of travel times experienced in a given departure window, then select specific values from this distribution according to a parameter we call the time percentile. This percentile ranges from 0 to 100 and represents how reliably a destination is reachable for travelers starting journeys in the selected departure window.

In general, this approach allows us to more appropriately characterize travel times between origin-destination pairs served by many alternative routes (e.g. a corridor with many overlapping bus services) than blanket half-headway assumptions. Note, however, that it assumes travelers have perfect knowledge of schedules in the network and act accordingly to minimize their travel time. In some cases, this assumption may not be appropriate. Travelers without access to complete schedule information may be inclined to board the first vehicle that arrives, even if others would allow them to arrive at their destination sooner.

We use the median or other percentile travel time, rather than the mean, because it can handle travel times that are infinite or undefined (for example, because the only route to a particular destination uses a bus that stops running before the end of the time window). For more details, please see Conway, Matthew Wigginton, Andrew Byrd, and Marco van der Linden (2017). “[Evidence-Based Transit and Land Use Sketch Planning Using Interactive Accessibility Methods on Combined Schedule and Headway-Based Networks](http://trrjournalonline.trb.org/doi/abs/10.3141/2653-06).”

Others calculate the accessibility at each departure time and taking a mean of accessibility as is done by the University of Minnesota [Accessibility Observatory](http://ao.umn.edu/). Conveyal Analysis does not use this approach because the travel time to each opportunity should be treated independently. Consider a situation of a small town situated between two major cities each with 500,000 jobs, with hourly train service to each city. Suppose that we’re interested in the number of jobs reachable in one hour, given departure during a time window of 8:00 to 9:00 AM. Further suppose that, due to how the train schedules are written, it is possible to commute to all jobs in the first city in under an hour if you leave between 8:00 and 8:15, and all the jobs in the second city are accessible if you leave between 8:30 and 8:45, and at other times no jobs are accessible. This corresponds to hourly trains to each city, leaving at 8:15 in one direction and 8:45 in the other, and needing 45 minutes to travel to the respective city. Using the average of accessibility, this location would have an accessibility of 250,000, because ¼ of the time 500,000 jobs are accessible in the first city, ¼ of the time 500,000 jobs are accessible in the second city, and ½ of the time no jobs are accessible. Thus the accessibility value would be 250,000 even though there is no job that can be reached in an average travel time of less than 60 minutes.

## Time percentile

Assuming service operates with perfect schedule adherence, the time percentile can be interpreted as how inclined travelers are to adjust their departure time based on transit schedules. Low time percentile values imply travelers are flexible and can start their journeys at times that minimize their waiting and overall travel time, which is appropriate for passengers accustomed to relying on schedules (e.g. commuter rail riders). Higher time percentile values are appropriate for passengers who expect “turn-up-and-go” service (e.g. users in dense areas with frequent service).

For most analyses, the default value of 50 is acceptable, though you may also want to consider 25th or 75th percentile travel times, depending on whether users are likely to use schedules or start trips randomly.

We assume passengers have perfect information about all schedules in the system and that they choose routes to minimize their total travel time. We also assume that passengers can board all vehicles, so we do not account for denied boardings due to vehicles or facilities that are inaccessible to people using wheelchairs, crowding, etc. Some routes may have frequencies/headways defined, but not explicit timetables, which can introduce uncertainty into results. Our routing engine (called R5) mitigates this uncertainty by simulating feasible timetables for all headway-based routes. For example, if the Red Line is set to depart Airport Station every ten minutes, without explicit timetables, one simulated timetable could include departures at 7:00, 7:10, 7:20…, and another simulated timetable could include departures at 7:02, 7:12, 7:22… The number of simulated schedules parameter in the analysis settings determines how many simulated timetables are used, rounding up to an integer number of schedules per minute in the departure window.

### Example

Consider travelers with the following hypothetical journey:

- Walk 10 minutes from their origins to a stop served by a single route
- Wait at the stop
- Board the first vehicle of the route that arrives at the stop, and ride it for 30 minutes
- Alight directly at their destinations

These travelers have at least 40 minutes of travel time, plus a waiting time that varies depending on when they begin their journey with respect to the route’s timetable.

Say these travelers want to begin their journeys sometime between 7:00 and 8:40 AM (a departure window of 100 minutes), and that they will only consider their destination reachable if their door-to-door travel time is less than 45 minutes. If the route departs the stop once per hour, at 7:00 and 8:00, there will only be five minutes of the departure window for which the destination is reachable. Travelers can start their journeys between 7:45 and 7:50, arriving at the station between 7:55 and 8:00 to board the 8:00 departure. The destination will only be considered reachable at time percentiles up to 5% (5 of the 100 possible departure minutes in the departure window). That level of reliability may be acceptable for travelers who are willing to structure their travel around schedules for services with low frequency.

If instead, the route departs the stop every 10 minutes, starting at 7:00, there will be fifty minutes of the departure window for which the destination is reachable (beginning trips between 7:05 and 7:10, or between 7:15 and 7:20, or between 7:25 and 7:30, etc.). The destination will be considered reachable at time percentiles up to 50%.

Finally, if the route departs every 5 minutes, the destination will be reachable within the 45-minute cutoff 100% of the time. Even if travelers just miss a vehicle, the next one will depart in 5 minutes, and they will arrive at their destination without exceeding the time cutoff.
