# earthquake-visualization
**visualization of USGS(US Geological Survey) api data using leaflet**
[USGS GeoJSON Feed](http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)
 Plate boundaries from https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json

**Part 1 is a simple map with plotted earthquake data from api**
- includes layer toggles and a legend with dynamic marker sizing and coloring.
- markers reflect the magnitude of the earthquake by their size and and depth of the earth quake by color. 
- Tooltips include information about the earthquake.

**Part 2 includes all of part 1 but incorporates a second data source and maps an additional layer**
- add plates:  <https://github.com/fraxen/tectonicplates>.
- toggles for swapping base maps 
- toggles for data sets overlays that can be turned on and off independently
- layer controls

