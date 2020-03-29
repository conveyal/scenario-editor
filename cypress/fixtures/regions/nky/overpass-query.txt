// this overpass query gets all the relevant data within 500m of routes in the TANK GTFS feed.
// define a global bounding box (s,w,n,e)
[bbox:38.9268,-84.7060,39.1199,-84.3592][timeout:600];

// get TANK routes
rel[route=bus][network=TANK]->.TANKroutes;

// select ways and relations of interest to r5 from within the bounding box
(
	way[highway];
  	way[public_transport=platform];
	way[railway=platform];
	way[park_ride];
	rel[restriction];
)->.bytag;

// filter this to only those elements only within 500m of TANK routes
nwr.bytag(around.TANKroutes:500); 

// join any children
(._;>;); 

out body qt;
