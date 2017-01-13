In the United State, we automatically populate opportunity data from [LODES](https://lehd.ces.census.gov/data/#lodes),
which contains location information about jobs and worker residences. If you wish to compute accessibility
using other information, or if you are outside the US, you will need to upload opportunity data. You can
do this by entering analysis mode and choosing "Create a new grid." You will be taken to a page where
you can upload a file. We support uploading either Shapefiles or CSV files with point information.

If you are uploading a shapefile, it should not be zipped. Select all of the files in the Shapefile
when uploading (at the very least, `.shp`, `.shx`, `.dbf` and `.prj`). How you select multiple files
depends on your browser and operating system, but generally will involve shift-clicking,
control-clicking or command-clicking.

<figure>
  <img src="../../img/upload-shapefile.png" />
  <figcaption>Uploading a Shapefile by selecting all constituent files</figcaption>
</figure>

If you upload a CSV file, two extra fields will appear, in which you must type the field names of the
latitude and longitude fields (we currently only support CSV files in WGS 84 Latitude/Longitude coordinates).

<figure>
  <img src="../../img/upload-csv.png" />
  <figcaption>Uploading a CSV file and entering the latitude and longitude columns</figcaption>
</figure>
