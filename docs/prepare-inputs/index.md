# Preparing a baseline transport network

<<<<<<< HEAD
Accessibility calculations will be based on the :term:`transport network` that is set up for your :term:`region`. This includes scheduled transit services as well as the region's network of streets, sidewalks, bikeways, etc. Initially you will set up a :term:`baseline network` representing the transit services described in the :term:`GTFS bundle` for your region. Later on you will likely want to compare alternative :term:`scenarios<scenario>` by creating :term:`modifications<modification>` to the baseline network. 

## Setting up a new region

The :term:`region` is a [bounding box](https://wiki.openstreetmap.org/wiki/Bounding_Box) defining the area to be used for accessibility calculations. It should generally cover the entire service area of the agency or agencies you will be working with. Opportunities and network components outside this area will generally not be considered.

The regions page, shown after you log in, provides a list of existing regions if any, and the option to create a new region. It is also accessible at any later point by clicking the globe icon (<i class="fa fa-globe"></i>). From the regions page, set up a new region by clicking:

<span class="btn btn-success"><i class="fa fa-plus"></i> Set up a new region</span>

Start by using the search bar in the map to automatically locate your city or country by name. You can also move the bounding box by dragging its corners on the map or by manually entering coordinates in the sidebar. Enter a name for the region and an optional description.

You must also upload an appropriate [OpenStreetMap](https://www.openstreetmap.org) (OSM) extract at this point, which will serve as the street layer of the transport network. This will be used for any walking or biking segments of a trip as well as for some transfers between stops and stations. Note that while several formats exist for OSM data, we require the [PBF format](https://wiki.openstreetmap.org/wiki/PBF_Format) because it is more compact and faster to process. Your extract should cover your entire service area or region, but not extend unnecessarily far beyond it as that may impact processing time.

The process of downloading and processing OSM data into an appropriate format is covered in the next section. For now, if all looks good with your region, you should be able to click the _Set up a new region_ button. After a bit of time for uploading and processing the OSM data, you should be prompted to upload a GTFS bundle.

### Preparing the OSM data

#### Downloading 

Extracts from the global OSM database can be downloaded in [many different ways](https://wiki.openstreetmap.org/wiki/Downloading_data). Some popular services like those provided by [Geofabrik](http://download.geofabrik.de) or [Nextzen](https://metro-extracts.nextzen.org/) provide easy downloads for selected cities and regions. Be sure to download data covering your entire region - the predefined areas used by these sites may or may not align well with your region. You'll often need to download an extract for a country or region larger than your true analysis area, then crop it to the size you need. 

#### Cropping

Performing accessibility analysis with excessively large OSM data can lead to significant increases in computation time and complexity. We strongly recommend cropping the data if they cover an area significantly larger than your transportation network or opportunity data. Several command line tools are able to perform these cropping operations: 
* [Osmosis](https://wiki.openstreetmap.org/wiki/Osmosis) is a multi-platform Java tool that works on Windows, Linux, and MacOS. 
* [OSMConvert](https://wiki.openstreetmap.org/wiki/Osmconvert) is a fast tool pre-built for Windows and Linux and available on MacOS and Linux as part of the `osmctools` package. 
* [Osmium-Tool](https://wiki.openstreetmap.org/wiki/Osmium) is a personal favorite that is extremely fast but only straightforward to install on Linux and MacOS platforms. 

Below are some example crop commands for these different tools. You'll need to replace `input.osm.pbf` with the name of your downloaded PBF file and change the coordinates of the area to clip to.

When creating a region, the panel will show an osmconvert command pre-filled with the current regional bouding box. If you have osmconvert installed locally, you can paste this command into to your local command line and modify the filenames to crop your OSM data to regional boundaries before upload.

**Osmosis:** 
```shell
osmosis --read-pbf input.osm.pbf \
  --bounding-box left=-79.63 bottom=43.61 right=-79.12 top=43.83 \
  --write-pbf cropped.osm.pbf
```

**OsmConvert:** 
```shell
osmconvert input.osm.pbf \
  -b=-79.63,43.61,-79.12,43.83 --complete-ways -o=cropped.osm.pbf
```

**Osmium-Tool:** 
```shell
osmium extract \
  --strategy complete_ways --bbox -79.63,43.61,-79.12,43.83 \
  input.osm.pbf -o cropped.osm.pbf
```

The latter two commands expect bounding boxes to be specified in the format `min_lon,min_lat,max_lon,max_lat`. We frequently find bounding boxes using the convenient [Klokantech bounding box tool](https://boundingbox.klokantech.com/). Selecting the "CSV" format in the lower left will give exactly the format expected by these tools. You can also adapt the bounding box values shown in the region setup panel of Analysis.

Note that files larger than 500MB may be rejected on upload. Please contact your support team if you genuinely need to upload a file of this size, or need assistance in cropping and filtering OSM data.

#### Filtering

OpenStreetMap contains a lot of data besides the streets, paths, and platforms we need for accessibility analysis. As of this writing more than half of the ways in OSM are buildings, and slightly less than a quarter are roads or paths. Filtering out unneeded data will reduce your file size and speed the upload and processing by Analysis. As in the previous section, sample commands are provided below that will remove any unneccessary tags and should dramatically reduce the output file size. 

**Osmosis:** 
```shell
osmosis \
  --read-pbf input.osm.pbf \
  --tf accept-ways highway=* public_transport=platform railway=platform park_ride=* \
  --tf accept-relations type=restriction \
  --used-node \
  --write-pbf filtered.osm.pbf
```

**Osmium-Tool:** 
```shell
osmium tags-filter input.osm.pbf \
  w/highway w/public_transport=platform w/railway=platform w/park_ride r/type=restriction \
  -o filtered.osm.pbf
```

## Uploading a GTFS bundle

Start by gathering :term:`GTFS feeds<GTFS feed>` for the transit agencies whose service will be included in your region. A GTFS feed is a set of CSV files inside a `.zip` archive, and a :term:`GTFS bundle` is a set of one or more GTFS feeds. 

If you just created a new region, you will be prompted to upload a GTFS bundle:

<span class="btn btn-success"><i class="fa fa-plus"></i> Create a bundle</span>

Otherwise, you can click the database icon (<i class="fa fa-database"></i>) on the sidebar to access your GTFS Bundles at any time. 

First you need to assign your new bundle a name. We recommend staying organized by basing the name on the time period and/or services included such as "TTC&GO - June 2019". Next choose one or more .zip files to upload. You can select multiple GTFS feeds in the file dialogue by shift-clicking, control-clicking or command-clicking (depending on your browser/operating system). Finally, click the create button to confirm.

Again, note that files larger than 500MB may be rejected on upload. The largest GTFS feeds in regular use are below 400MB and most are much smaller than this. A larger file may indicate a problem. Please contact your support team if you genuinely need to upload a larger file.

If there is no GTFS available for your region you can, as a workaround, create a blank slate by using a valid GTFS feed from somewhere else in the world. After creating a project as described below, you can then attempt to [import modifications](../edit-scenario/usage.html#importing-modifications) from a shapefile representing service in your region.

Ensure any GTFS you upload follows requirements of the specification. Various [validation tools](https://gtfs.org/testing/) are available. Common issues include:
* Missing required files
* Calendar dates that do not cover an intended date of analysis.
* Using values other than 0-7 in the route_type column of routes.txt

## Creating a Project

Uploading and processing a GTFS bundle may take several minutes. Once processing is complete, you should be able to create a new :term:`project` based on the bundle you uploaded. If you aren't on the projects page already, click the project icon (<i class="fa fa-cubes"></i>) and then,

<span class="btn btn-success"><i class="fa fa-plus"></i> Create new Project</span>

A project is essentially a wrapper around a bundle which associates it with any scenarios and modifications you may create later on. The purpose of projects is to allow multiple users to work simultaneously on the same baseline network without stepping on each other's toes. The section on :ref:`managing_mods` describes how modifications can be shared between projects that are based on the same bundle. Once created, the bundle associated with a project cannot be changed. 

Give the project a descriptive name, select a bundle to which the project will be associated, and click the create button to confirm. 
You are now ready to move on to [editing scenarios](../edit-scenario).
