// define a global bounding box (s,w,n,e)
[bbox:45.27,-123.17,45.83,-122.28];

// select ways and relations of interest from within the bounding box
(
	way[highway];
  	way[public_transport=platform];
	way[railway=platform];
	way[park_ride];
	rel[restriction];
);

// join any children of the above ways and relations
(._;>;); 

out body qt;
