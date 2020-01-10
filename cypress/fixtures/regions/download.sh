#/bin/bash
# Here's a script to get all the data for testing region setup

# PORTLAND

# download Portland GTFS
wget https://developer.trimet.org/schedule/gtfs.zip -O portland/trimet.gtfs.zip

# download Vancouver WA GTFS
wget https://www.c-tran.com/images/Google/GoogleTransitUpload.zip -O portland/ctran.gtfs.zip

# download Portland OSM XML
wget -O portland/streets.osm --post-file=portland/overpass-query.txt https://overpass-api.de/api/interpreter
# convert to xml
osmium cat --overwrite portland/streets.osm -o portland/streets.osm.pbf
rm portland/streets.osm



# CINCINNATI

# download SORTA GTFS
wget https://www.go-metro.com/uploads/GTFS/google_transit_info.zip -O cincinnati/SORTA.gtfs.zip

# download TANK GTFS
wget https://www.tankbus.org/Portals/tankbus/gtfs/tank-google-transit.zip -O cincinnati/TANK.gtfs.zip

# download Cincy OSM XML
wget -O cincinnati/streets.osm --post-file=cincinnati/overpass-query.txt https://overpass-api.de/api/interpreter
# convert to xml
osmium cat --overwrite cincinnati/streets.osm -o cincinnati/streets.osm.pbf
rm cincinnati/streets.osm
