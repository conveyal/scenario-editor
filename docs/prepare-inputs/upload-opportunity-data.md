# Preparing opportunity datasets

To measure access to spatially distributed opportunities (e.g. jobs, people, schools), you will need to ensure at least one **opportunity dataset** has been added to your project. To add or manage opportunity datasets, click the grid icon on the sidebar:
<br><span class="ui-icon"><i class="fa fa-th"></i> Opportunity Datasets</span>

Opportunity datasets can be added either by uploading a CSV or shapefile representing the spatial distribution of opportunities, or by using the LODES data import tool (US only).

.. _upload_opportunities:

## Uploading an opportunity dataset

A spatial dataset representing any opportunities of interest can be uploaded in one of three formats:

- CSV
- shapefile
- our custom .grid format

To start an upload, click: <br><span class="btn btn-success"><i class="fa fa-plus"></i> Upload a new opportunity dataset</span>

Enter a name for the opportunity dataset source, then select the appropriate file(s). Once this is done, click the upload button to start the upload. Opportunity datasets will be saved with the source name you entered and the attribute/column names, if any, of the uploaded files.

After processing is complete you can select a dataset from the dropdown menu to show a dot-density map of your opportunity data converted to the [grid](../analysis/methodology.html#spatial-resolution) used in Conveyal Analysis.

### CSV

A [Comma Separated Value](https://en.wikipedia.org/wiki/Comma-separated_values) (CSV) file can be used to represent opportunities as point features. The CSV should have columns for latitude, longitude, and one or more associated opportunity counts.

In the following example, a CSV file represents the location of restaurants along with the number of restaurants (1 per point) and the estimated number of employees at each. Such a dataset could be used to represent either opportunities for entertainment or for work.

```csv
lat,lon,restaurant_count,est_employees,name
39.111475,-84.633360,1,5,"La Rosa's Pizza"
39.105990,-84.556554,1,12,"Primavista"
39.103175,-84.509386,1,8,"Shanghai Mama’s"
39.160658,-84.543407,1,11,"Boswell Alley"
39.100883,-84.512742,1,25,"McCormick & Schmick's"
...
```

Note that only _numeric_ fields will be accepted. The `name` field in this example would be dropped. Be careful to give each column a meaningful name in the header row and remove any numeric columns which do not represent opportunity counts such as ID fields. Be sure to name the file with a `.csv` extension and use only commas as separators, i.e. no tab-separated or fixed-width text files.

You will be prompted for the names of the fields containing latitude and longitude values. In the example above you would enter `lat` and `lon` respectively. We currently only support CSV files which specify points in WGS 84 latitude/longitude coordinates.

### Shapefiles

A shapefile may represent opportunities as either points or polygons. Opportunity counts associated with polygons will be treated as though they are uniformly distributed within the given area. For the easiest experience, any numeric fields not representing opportunities (ID fields, etc) should be removed before uploading. As with CSV, text fields will be dropped - this includes fields which may look like numbers (e.g. `"1"`, `"NA"`) but are actually stored as text. If a field is not showing up after upload, ensure that it was actually stored as a numeric value rather than text.

Shapefiles should not be zipped; select all of the files in the Shapefile when uploading (at the very least, `.shp`, `.shx`, `.dbf` and `.prj`). How you select multiple files depends on your browser and operating system, but generally will involve shift-clicking, control-clicking or command-clicking.

<figure>
  <img src="../img/upload-shapefile.png" />
  <figcaption>Uploading a Shapefile by selecting all constituent files</figcaption>
</figure>

## Managing opportunity datasets

Selecting an existing opportunity dataset from the dropdown menu will give you options to:

<span class="btn btn-warning"><i class="fa fa-pencil"></i> Edit dataset name</span><br>
<span class="btn btn-danger"><i class="fa fa-trash"></i> Delete this dataset</span><br>
<span class="btn btn-danger"><i class="fa fa-trash"></i> Delete entire dataset source</span> (e.g. all attributes from a shapefile)

You can also download your dataset as a [geoTiff](https://en.wikipedia.org/wiki/GeoTIFF) raster file for use in an external GIS application, or you can download it in our custom .grid format, which may be useful for preserving the exact data used in an analysis or transfering it between regions.

## LODES dataset import

For projects in the United States, employment data from from the _Longitudinal Employer-Household Dynamics_ ([LEHD](https://lehd.ces.census.gov/)) Program can be imported with a one-click import function.

<span class="btn btn-info"><i class="fa fa-group"></i> Fetch LODES (2015)</span>

The [LODES](https://lehd.ces.census.gov/data/#lodes) (_LEHD Origin-Destination Employment Statistics_) dataset provides block-level data on the home and work locations of employed people living in the US. These job and worker counts are made available both as totals and as counts disaggregated by industry, earnings, education level, etc.

Conveyal will update the LODES one-click import function after the Census Bureau addresses certain data limitations for more recent years. The current releases for 2016 and 2017 exclude federal employees, and the 2017 release is missing data for Alaska and South Dakota. For more information, see the [LODES technical documentation](https://lehd.ces.census.gov/data/lodes/LODES7/LODESTechDoc7.4.pdf).
