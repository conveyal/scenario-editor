# OpenStreetMap

Typically, the street layer of a baseline network in Conveyal contains data from OpenStreetMap. These open data are [(c) OpenStreetMap contributors](https://www.openstreetmap.org/copyright) and made available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/).

## Contributing to OSM

In the spirit of contributing back to OSM, if you need to correct or improve the baseline street network, we encourage you make edits directly at [https://www.openstreetmap.org/](https://www.openstreetmap.org/).

## Example attribution notice

If you distribute results from Conveyal outside your organization (i.e. Publicly Use a Produced Work under the terms of the ODbL), to comply with ODbL Section 4.3, we recommend including this attribution notice:

"Produced using street network data that is [(c) OpenStreetMap contributors](https://www.openstreetmap.org/copyright)."

## Additional License Details: Produced Works and Derivative Databases

If you're curious about additional nuances of the OSM ODbL, the following discussion may be of interest.

The ODbL differentiates between "Produced Works" and "Derivative Databases." Both are subject to the attribution requirements discussed above. Derivative Databases, and Produced Works from Derivative Databases, are subject to additional license requirements (e.g. "share alike"). Our interpretation of the license and OSM guidance is that standard Conveyal outputs are Produced Works (not from a Derivative Database), and therefore not subject to the additional share-alike requirements.

Standard Conveyal outputs should not be subject to Sections 4.2 or 4.4 because they are not Databases. The ODbL definition of "Database" specifies contents are "individually accessible." The OpenStreetMap Foundation offers [this related guideline](https://wiki.osmfoundation.org/wiki/Licence/Community_Guidelines/Produced_Work_-_Guideline): "The published result of your project is either a Produced Worked or a Derivative Database within the meaning of the ODbL. If the published result of your project is ***intended for the extraction of the original data***, then it is a database and not a Produced Work. Otherwise it is a Produced Work." Because standard Conveyal outputs do not allow for the extraction of original OSM data, they should not be considered a Database with respect to the license.

Furthermore, standard Conveyal outputs should not be considered Produced Works from a Derivative Database subject to Section 4.6.  [Trivial transformations](https://wiki.osmfoundation.org/wiki/Licence/Community_Guidelines/Trivial_Transformations_-_Guideline) occur when reading OSM into a Conveyal network bundle, then a Collective Database is created when the transit layer from GTFS is joined. So standard outputs are based on a Collective Database, containing the original OSM (the "Database," trivially transformed for routing) and transit data. The spirit of OSM is that contributions are freely available, and in this case, anyone could access the street data used for your results from canonical openstreetmap.org.