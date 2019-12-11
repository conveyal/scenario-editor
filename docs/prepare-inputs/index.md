# Preparing baseline network

Start by gathering [GTFS](../glossary.html#GTFS) files for the transit agencies whose service will be included in your scenarios. If there is no GTFS available for your region, as a workaround you can use a valid GTFS feed from somewhere else in the world, follow the steps below, then attempt to [import route alignment shapefiles](../edit-scenario/index.html#importing-modifications-from-shapefiles) representing service in your region.

## Setting up a new region

From the initial login page, set up a new region by clicking
<br><span class="btn btn-success"><i class="fa fa-plus"></i> Set up a new region</span>

If any regions have already been created, they will be shown in a list below this button.

When setting up a new region, enter a name and specify boundaries by moving the bounding box on the map. You must also upload an appropriate OpenStreetMap (OSM) extract in this view, which will serve as the road layer of the transport network. OSM extracts can be downloaded from services such as [Geofabrik](http://download.geofabrik.de) or [Nextzen](https://metro-extracts.nextzen.org/). Note that several formats exist for OSM data. We always use the PBF format because it is more compact and faster to process.

### Filtering OSM data

The OSM database contains a lot of other data besides the roads, paths, and public transportation platform data we need for accessibility analysis. As of this writing, according to [TagInfo](https://taginfo.openstreetmap.org/) 59% of the ways in OSM are buildings, and only 23% are roads or paths. Buildings frequently have more complex shapes than roads, and objects like waterways or political boundaries can be very large in size. It has been jokingly said that OSM should be renamed "OpenBuildingMap" rather than "OpenStreetMap".

Removing unneeded data will reduce the time and network bandwidth needed to the upload the file to Analysis, and will speed up the processing stages where the OSM data is converted into a routable street network. Several command line tools exist to filter OSM data. If you are familiar with the command line or comfortable experimenting with it, you may want to try [Osmosis](https://wiki.openstreetmap.org/wiki/Osmosis), [Osmium-Tool](https://wiki.openstreetmap.org/wiki/Osmium), or [OSMFilter](https://wiki.openstreetmap.org/wiki/Osmfilter). Osmium-Tool is extremely fast but is only straightforward to install on Linux and MacOS platforms. Osmosis is often slower at filtering but will also work on Windows as it's a multi-platform Java application. OSMFilter cannot work with PBF format files so we rarely use it. Below are some example commands for retaining only OSM data useful for accessibility analysis. You would need to replace `input.osm.pbf` with the OSM data file you downloaded.

**Osmosis:** 
```
osmosis \
  --read-pbf input.osm.pbf \
  --tf accept-ways highway=* public_transport=platform railway=platform park_ride=* \
  --tf accept-relations type=restriction \
  --used-node \
  --write-pbf filtered.osm.pbf
```

**Osmium-Tool:** 
```
osmium tags-filter input.osm.pbf \
  w/highway w/public_transport=platform w/railway=platform w/park_ride r/type=restriction \
  -o filtered.osm.pbf
```

### Cropping OSM data

Services producing automated extracts of OSM data like [Geofabrik](http://download.geofabrik.de) or [Nextzen](https://metro-extracts.nextzen.org/) are limited to predefined areas. You'll often need to download an extract for a country or region larger than your true analysis area, then cut it down to size. 

Performing accessibility analysis with excessively large OSM data can lead to significant increases in computation time and complexity. Therefore we strongly recommend cropping the OSM data if they cover an area significantly larger than your transportation network or opportunity data. Several command line tools are also able to perform these cropping operations: [Osmosis](https://wiki.openstreetmap.org/wiki/Osmosis) is a multi-platform Java tool that works on Windows, Linux, and MacOS but is relatively slow, [OSMConvert](https://wiki.openstreetmap.org/wiki/Osmconvert) is a fast tool pre-built for Windows and Linux and available on MacOS and Linux distributions as part of `osmctools` package. [Osmium-Tool](https://wiki.openstreetmap.org/wiki/Osmium) is a personal favorite that is extremely fast but only straightforward to install on Linux and MacOS platforms. Below are some example crop commands for these different tools:

**Osmosis:** 
```
osmosis --read-pbf input.osm.pbf \
  --bounding-box left=-79.63 bottom=43.61 right=-79.12 top=43.83 \
  --write-pbf cropped.osm.pbf
```

**OsmConvert:** 
```
osmconvert input.osm.pbf \
  -b=-79.63,43.61,-79.12,43.83 --complete-ways -o=cropped.osm.pbf
```

**Osmium-Tool:** 
```
osmium extract \
  --strategy complete_ways --bbox -79.63,43.61,-79.12,43.83 \
  input.osm.pbf -o cropped.osm.pbf
```

The latter two commands expect bounding boxes to be specified in the format `min_lon,min_lat,max_lon,max_lat`. We frequently find bounding boxes using the convenient [Klokantech bounding box tool](https://boundingbox.klokantech.com/). Selecting the "CSV" format in the lower left will give exactly the format expected by these tools. You can also adapt the bounding box values shown in the region setup panel of Analysis.

When creating a region, the panel will show an osmconvert command pre-filled with the current regional bouding box. If you have osmconvert installed locally, you can paste this command into to your local command line and modify the filenames to crop your OSM data to regional boundaries before upload.

Note that files larger than 500MB may be rejected on upload. Please contact us if you genuinely need to upload a file of this size, or need assistance in cropping and filtering OSM data.

## Uploading a GTFS bundle

On the main page for a region, upload your first bundle of GTFS feeds by clicking:
<br><span class="btn btn-success"><i class="fa fa-database"></i> Upload a new GTFS Bundle</span>

You can also click this icon on the sidebar to access GTFS Bundles:
<br><span class="ui-icon"><i class="fa fa-database"></i> GTFS Bundles</span>

This will take you to the GTFS Bundles page, where you can give the Bundle a name and choose .zip files to upload. If you have multiple GTFS feed .zip files, you can select them by shift-clicking, control-clicking or command-clicking (depending on your browser/operating system).  Finally, click the create button to confirm.

Again, note that files larger than 500MB may be rejected on upload. The largest GTFS in regular use are below 400MB so a larger file may indicate a problem. Please contact us if you genuinely need to upload a file of this size.

## Creating a Project

Uploading and processing a bundle may take several minutes.  Once processing is complete, on the Projects page, click:
<br><span class="btn btn-success"><i class="fa fa-plus"></i> Create new Project</span>

This will take you to the Create new Project page, where you can give the Project a name, select a bundle to which the project will be associated, and click the create button to confirm. You are now ready to move on to [editing scenarios](../edit-scenario).
