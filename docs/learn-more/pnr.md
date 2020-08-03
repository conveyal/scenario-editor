# Park and Ride

When transit modes are selected in analysis, park-and-ride can be selected as an access mode. Park-and-ride access uses locations identified based on certain OSM tags in the street layer of the baseline network, specifically nodes and ways (including areas and buildings) tagged with any `park_ride=*` value except `park_ride=no`. 

This access mode requires the car to be parked and transit to be used before the journey is complete. Therefore the isochrones do not radiate out from the origin point; they radiate out from the destination transit stops that can be reached by parking the car, walking to a transit stop, riding a transit vehicle, then exiting transit. The initial driving portion of the trip may reach far into the transit network, allowing the rider to park the car and board transit too close to the destination. For the time being, the main parameter used to mitigate this problem is maxCarTime, which defaults to 30 minutes. Custom values may be specified by adding a property like `"maxCarTime": 15` (in minutes) to the request JSON in the advanced analysis settings.

In many places parking facilities are already present in the OSM data, but have not been specifically tagged for park-and-ride. Since most parking lots do not allow leaving a vehicle to ride transit, we cannot assume they allow park-and-ride. You may need to audit the OSM data for your region and add the necessary tags. If your workflow allows it, we encourage you to make your edits in the main OSM database at osm.org, thereby contributing them back to the mapping community. Such changes are usually reflected in OSM extracts such as those at geofabrik.de within one day.

## Special Cases

In OSM, the park_ride tag may take the values yes, no, bus, train, tram, metro, and ferry. The values "no" and "yes" are by far the most common, but "train" and "bus" are sometimes seen. Currently, we do not enforce these associations between park and ride facilities and single modes of transit.

We have encountered a small number of cases where OSM multipolygon relations (representing parking structures with holes) are tagged with `park_ride=*`. This is valid OSM data, but Conveyal does not yet recognize OSM relations as park and ride facilities. As a stopgap, you can copy the relation's `park_ride=*` tag onto way within the relation representing the outer wall of the building. However this should only be done on locally edited data, as such duplicate tags are not considered correct in the main public OSM database.
