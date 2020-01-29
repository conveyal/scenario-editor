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
