# Frequently Asked Questions

.. _why_the_wait:
### When starting an analysis, why does the "initializing cluster" message persist for so long?

Three steps need to take place when starting a new analysis.

First, the main Analysis server must request and initialize a computation cluster from Amazon Web Services.  For scalability, we start a "worker" server for each :term:`transport network` being analyzed.  This means that even if you are already successfully fetching analysis results for a project, a new server will be needed if you switch to a project associated with a different GTFS bundle or region, or if you change the routing engine. 

Second, the worker server needs to set up a transport network.  The server checks whether the required transport network is already built and available for download from Amazon S3.  If it is, the server downloads it and proceeds to the next step.  If a pre-built network cannot be downloaded, the server downloads the required input files (OSM extract and GTFS bundle).  It will then build the transport network by combining the road and transit layers, which be a lengthy process (on the order of 10 minutes for large regions, and an hour for very large regions with dense networks).  To avoid having to repeat this step, the server will upload the built network to S3 for future use.

Third, once a transport network is downloaded or built, certain caching operations related to access mode (e.g. walking or biking) need to be completed. We're currently working on some optimizations for this step, so you still may see some time-out errors on your first analyses or when switching access modes. Refreshing your browser page should resolve the issue.

By default, servers check for activity about every hour after starting up, and they automatically shut down if there is no recent activity.  If you need us to override this default shutdown behavior for critical analyses, get in touch.

### How can I add more servers to a cluster to speed up regional analyses?

To complete regional analyses quickly, we can clone hundreds of servers within a cluster for a transport network.  We haven't yet built the user interface to launch additional servers from within Conveyal Analysis, so for the moment, get in touch with your support team if you need to speed up analyses.

### Who can see and edit my projects?

All authorized users within an organization have access to that organization's regions, projects, and scenarios.  Multiple users should not edit or analyze the same project concurrently.  If multiple users try to make edits simultaneously, or if you have Conveyal Analysis open in multiple browser tabs, you may see "data out of date" errors.
