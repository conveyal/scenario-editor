# Cycling Level of Traffic Stress LTS

## Analyzing LTS

When analyzing access by cycling, you may want to limit use of streets that most riders would consider dangerous or stressful. Different researchers have proposed various ways of quantifying stress for cyclists:

* [Level of Traffic Stress](http://transweb.sjsu.edu/research/low-stress-bicycling-and-network-connectivity) (LTS), developed by researchers at the Mineta Transportation Institute
* [Conveyal Estimated LTS](https://blog.conveyal.com/better-measures-of-bike-accessibility-d875ae5ed831), developed by Conveyal for contexts where no data beyond basic OpenStreetMap (OSM) tags are available

When cycling is enabled in Conveyal Analysis, varying the Max Level of Traffic Stress limit can provide insights into gaps in a region’s cycling infrastructure. Setting Max LTS to 1 in an analysis will allow cycling only on separated bicycle infrastructure or low-traffic streets; routing will revert to walking when traversing any links with LTS exceeding 1. Setting Max LTS to 3 in an analysis will allow cycling on links with LTS 1, 2, or 3. Differences in access between these two analyses may highlight places where new dedicated cycling infrastructure could improve access for cyclists with lower tolerances for stressful conditions.

## Labeling Network Edges with LTS

### Conveyal Estimated LTS

The default methodology in Conveyal Analysis for assigning LTS values to network edges is based on commonly tagged attributes of OSM ways. The sequential logic for assigning these Conveyal Estimated LTS values in v5.9.0 of the routing engine can be viewed in its [source code](https://github.com/conveyal/analysis-backend/blob/v5.9.0/src/main/java/com/conveyal/r5/labeling/LevelOfTrafficStressLabeler.java) and is summarized below:

***Initial round***

* If way does not allow cars, assign LTS 1
* If way has highway=service tag, do not assign LTS in this round
* If way has a highway=residential or highway=living_street tag, assign LTS 1
* If tagged maxspeed value is less than 25 mph (40.25 kph) and the number of lanes is less than 4 or unspecified, assign LTS 2
* If way has tag highway=unclassified, highway=tertiary, or highway=tertiary-link and the number of lanes is less than 4 or there is cycleway tag for the correct direction, assign LTS 2
* Otherwise, if there is a cycleway tag for the correct direction, assign LTS 3
* Otherwise, assign LTS 4

***Unsignalized intersection adjustment round***

The baseline network edges constructed from the initial round are then updated to account for intersections. At each vertex without a traffic signal tag, the highest LTS of any edge entering or exiting the vertex is assigned to all edges entering or exiting the vertex. Note that this step may lead to counterintuitive results -- for example, segments of a cycle path before and after crossing an LTS 4 street will be assigned LTS 4, even though the path on its own would be expected to have LTS 1.

The initial version of the LTS methodology does not cover signalized intersections, so this round does not consider vertices derived from nodes with signal tags are not affected.

### Custom LTS

To override the default method described above, you can pre-process OSM before uploading it to Conveyal. Add the tag "lts=" to ways, with numeric values 1-4.
