# Frequently Asked Questions

### How does Conveyal Analysis calculate travel times?

Conveyal Analysis calculates door-to-door total travel time, without any subjective impedance factors. Travel times are always computed by finding actual paths through a full street and (where applicable) public transport ("transit", in American English) network. By default, Conveyal Analysis uses the centers of [high-resolution grid cells](../analysis/methodology.html#spatial-resolution) as destinations.

For analyses with transit disabled, the total travel time from an origin to a destination includes time spent:

1. Walking from the selected origin to the nearest point on the street network
1. Traveling to the point on the street network nearest to the destination, using the selected direct mode (walk, bicycle, or car)
1. Walking from the street network to the destination

For analyses with transit enabled, the total travel time from an origin to a destination includes time spent:

1. Walking from the selected origin to the nearest point on the street network
1. Reaching nearby transit stops via the street network, using the selected access mode (walk, bicycle, or car)
1. Waiting to board transit (initially and at transfers)
1. Riding in transit vehicles
1. Walking via the street network between transit stops for transfers
1. Traveling from transit stops to the point on the street network nearest to the destination, using the selected egress mode
1. Walking from that point on the street network the directly to the center of the grid cell.

If it is faster to reach a destination directly, without using transit, the routing engine will replace the second step above with direct travel along the street network to the point on the street network nearest the to the destination, then skip to the final step. Public transport routing uses actual schedules from the imported GTFS feeds. For every origin, Conveyal Analysis finds a large number of travel times to every destination grid cell. Different travel times may be found for each departure time (each minute in the specified time window). If new transit routes have been added with frequencies but without specific departure times, many different possible schedules are also tested producing hundreds or thousands of possible travel times (according to the "simulated schedules" advanced parameter). All these different travel times imply a statistical distribution, from which a certain percentile of travel time, set in the user interface, can be read.

.. _why_the_wait:
### When starting an analysis, why does the "initializing cluster" message persist for so long?

First, the main Analysis server must request and initialize a computation cluster from Amazon Web Services. For scalability, we start a "worker" server for each :term:`transport network` being analyzed. This means that even if you are already successfully fetching analysis results for a project, a new server will be needed if you switch to a project associated with a different GTFS bundle or region, or if you change the routing engine. 

To complete regional analyses quickly, we can clone hundreds of servers within a cluster for a transport network. We haven't yet built the user interface to launch additional servers from within Conveyal Analysis, so for the moment, get in touch with your support team if you need to speed up analyses.

### Why are travel times longer than expected?

Because Conveyal Analysis includes waiting time, which can vary greatly depending on when one departs, total travel times may be longer than you might initially expect. Varying the travel time percentile can help you determine what role service frequency plays in waiting times (and therefore total travel times) for your network. The fifth percentile usually reflects trips with close-to-minimal waiting times (e.g. when passengers consult schedules and adjust the start of their trips to minimize overall travel times).

Another potential explanation for unexpectedly long travel times is that origins, destinations, and stops are all linked to the nearest edge in a network's street layer. This linking behavior can lead to unexpected results, especially for stops, origins, or destinations in areas with sparse street or pedestrian networks. Consider these examples:

- You place the origin directly on a transit stop with fast, frequent service, but travel times using the service show an unexpected delay. Because total travel time includes walking from the origin to the nearest street or pedestrian path in the baseline street layer, then from the street layer (back) to the transit stop, there may be an unexpectedly long access time if the stop is far from a nearby street.
- You notice a very long transfer time between two nearby stops. If these stops are linked to different street edges, and the street edges are only connected via a long, circuitous path, the walking time for the transfer will be unexpectedly long.

To avoid such issues, we suggest placing stops close to streets or pedestrian paths, and snapping to stops that exist in the baseline transit layer when feasible.

Uploaded OpenStreetMap data with poorly connected subnetworks may also lead to issues. If you notice strangely non-contiguous isochrones, they may reflect destinations being linked to such a subnetwork (e.g. a network of walking paths in a park that only connects to the rest of the street network at a few locations).


### Who can see and edit my projects?

All authorized users within an organization have access to that organization's regions, projects, and scenarios. Multiple users should not edit or analyze the same project concurrently. If multiple users try to edit the same modification simultaneously, or if you have Conveyal Analysis open in multiple browser tabs, you may see "data out of date" errors.

### How long should it take to start a single-origin analysis?

Three steps take place when starting a new single-origin analysis.

First, the main Analysis server must request and initialize a compute cluster from Amazon Web Services. For scalability, we start a "worker" server for each [transport network](../glossary.html#transport-network) being analyzed. This means that even if you are already successfully fetching analysis results for a project, a new server will be needed if you switch to a project associated with a different GTFS bundle or region, or if you change the routing engine version.

Second, the worker server needs to set up a transport network. It first checks whether the required transport network is already built and available for download from Amazon S3. If it is, the server downloads it and proceeds to step 3. If a pre-built network cannot be downloaded, the server downloads the required input files (OSM extract and GTFS bundle). It then builds the transport network by combining the road and transit layers, which can be a lengthy process (on the order of 10 minutes for large regions, and an hour for very large regions with dense networks). To avoid having to repeat this step, the server will upload the built network to S3 for future use.

Third, once a transport network is downloaded or built, certain caching operations related to egress mode (e.g. walking or biking) need to be completed.

Recent routing engine versions provide status updates on these steps, including:

- _Starting routing server. Expect status updates within a few minutes._
  - Trigger: analysis using a project that has not been analyzed within the last hour
  - Expected duration: 2-3 minutes
- _Building network..._
  - Trigger: analysis using a new GTFS bundle, scenario, or routing engine version
  - Expected duration: 5-50 minutes, depending on size of transit network
- _Linking grids to the street network and finding distances..._
  - Trigger: analysis using an updated egress mode or scenario
  - Expected duration: up to a few minutes, depending on extent of region
- _Performing analysis..._
  - Expected duration: a few seconds

By default, servers automatically shut down after one hour of inactivity. If you to override this default shutdown behavior for critical analyses, get in touch with your support team.

### How long should each regional analysis take?

The time required to complete a regional analysis is a function of the size of the region, number of origins, and size and complexity of the transit network. Generally, computation is slower for routes specified as add-trip modifications than for routes specified in the baseline GTFS bundle. If frequency-based routes are present in the scenario's add-trip modifications or the base GTFS, compute time will also depend on the number of simulated schedules (Monte Carlo draws).

Additional servers start automatically once a results for few origins in a regional analysis have completed successfully. The number of additional servers is a function of the number of origins, with a default cap set to approximately 250. If you need a higher cap to complete a large batch of analyses quickly, contact your support team.

### How do I model corridor upgrades where a new trunk is added and existing services are converted to feeder routes?

The new trunk service can be represented with an
[add-trip modification](../edit-scenario/modifications.html#add-trips). Existing services can be curtailed using [reroute modifications](../edit-scenario/modifications.html#reroute). You will need separate modifications for each direction of each curtailed route, setting the start/end stop to the stop at which the route will be curtailed as a feeder to the new trunk.

### What new features is Conveyal working on?

Conveyal releases new features and improvements for the cloud-hosted version of Conveyal Analysis every few months. We regularly discuss with customers to understand how they use the system and identify features they would find useful. We create a roadmap containing features that we can realistically implement, considering long-term reliability and maintainability. If a customer wishes to pay for development effort or use development/support hours bundled in their contract to cover additional software development, features can be prioritized.
