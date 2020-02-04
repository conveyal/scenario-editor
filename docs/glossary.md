# Glossary

Several terms have a special or specific meaning in the context of Conveyal Analysis. While we hope that their meaning is usually clear enough from the context, this glossary is provided for reference. 

.. glossary:: :sorted:

   GTFS
   GTFS feed
      `General Transit Feed Specification <https://developers.google.com/transit/gtfs/>`_, a format for transit network and schedule data. Most transit agencies produce **GTFS** feeds to power customer-facing trip planning applications, but they are also useful for analysis.

   GTFS bundle
      A GTFS bundle is a grouped set of one or more GTFS packages associated with your region. A region can have multiple bundles and a bundle could include a single agency's GTFS or those of several adjacent or overlapping agencies. The bundle is used to represent the baseline transit service and as a starting point for some types of modifications. 

   routing engine
      `Conveyal R5 <https://github.com/conveyal/r5>`_ is the core computational software behind Conveyal Analysis.  It performs one-to-many searches on multimodal (transit/bike/walk/car) transport networks.

   transport network
      A routable network with transit and road layers, built by a specific version of R5. The transit layer is built from a GTFS bundle and the road layer is built from the OpenStreetMap network associated with a region.

   baseline network
      The baseline network is the transport network (i.e. street network plus a GTFS bundle) without any associated modifications. It is a useful point of comparison during analysis and a starting point for most modifications. 

   region
      The region is the rectangular area used for accessibility analysis. It should geographically contain any scheduled transit services and network modifications.

   project
      A project is means of associating scenarios and modifications with a particular GTFS bundle. A project is associated with only one bundle which cannot be changed after it is created. 

   modification
      A modification is an alteration of some kind made to scheduled transit services. e.g. the removal of a line, a rerouting, a new service etc. These must be applied in scenarios to be used in analysis. 

   scenario
      A scenario is a set of modifications packaged together. For example you might create a scenario, called "proposed service cuts" in which several modifications reduce service separately on lines A, B and C. 

   trip pattern
      A trip pattern is a sequence of stops visited by a transit vehicle. A trip pattern can have many trips, and a route consists of a one or more trip patterns. A basic two-way route might consist of two trip patterns - e.g. one for inbound service, one outbound. Each might make stops on different sides of the street and/or in a different order. 

   trip
      A single vehicle trip, representing a single vehicle visiting the stops on a particular trip pattern at a particular set of times.

   segment
      A portion of a :term:`trip pattern` consisting of a transit vehicle traveling between two consecutive stops.

   isochrone
      An `isochrone <https://en.wiktionary.org/wiki/isochrone#English>`_ is a boundary around a given origin point defined such that travel from the origin to any point on the boundary takes an equal amount of time. Conveyal Analysis calculates travel time over a departure window, so the travel time used is actually a selected percentile in a distribution of travel times. 

   opportunity dataset
      An opportunity dataset is a spatial dataset with one or more numeric fields representing a count of opportunities (destinations) at particular locations in your :term:`region`. See :ref:`upload_opportunities`.
