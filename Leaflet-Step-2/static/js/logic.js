// links to the plate boundaries and earthquake data sources
const platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
const apiLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// create layer groups for each data set
plates = new L.LayerGroup();
earthquakes = new L.LayerGroup();

const overlayMaps = { // object containing controller options
    "Plate Boundaries": plates, 
    "Earthquakes": earthquakes 
}

// define the different types of map tiles that users may select
const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});

const light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
});

const dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

// object containing controller options to select map tiles
const baseMaps = { 
    "Satellite": satellite,
    "Light": light,
    "Dark": dark
};

// create map object to add to map
const myMap = L.map("map", { // connects map to html "map" div and assigns attributes from this object
    center: [13.6929, -89.2182], // center on San Salvador
    zoom: 3,
    layers: [satellite, earthquakes]
});

// create the control layer and add everything to the map
L.control.layers(baseMaps, overlayMaps, { 
    collapsed: false,
}).addTo(myMap);

// function to set colors of markers and the legend
const markerColors = [ // object that provides ranges and colors
    { range: [-10, 10], name: "Green", markerColor: "rgb(150,250,4)" },
    { range: [10, 30], name: "Light Green", markerColor: "rgb(212,246,11)" },
    { range: [30, 50], name: "Light Orange", markerColor: "rgb(244,214,18)" },
    { range: [50, 70], name: "Dark Orange", markerColor: "rgb(251,169,33)" },
    { range: [70, 90], name: "Light Red", markerColor: "rgb(249,145,76)" },
    { range: [90], name: "Red", markerColor: "rgb(251,65,79)" }
];

// look up the color in and return it - I used a ternary operator to handle the case of the top range - dope!!
function getFillColor(value) {
    let myIndex = markerColors.findIndex(v => (v.range[1] ? value >= v.range[0] && value <= v.range[1] : value >= v.range[0]));
    console.log(`${value}:  ${myIndex}`);
    return markerColors[myIndex].markerColor;
}

// retrieve data and create map objects
d3.json(platesLink).then(function (plateData) {
    console.log(plateData); // data object contains unnecessary information

    L.geoJson(plateData, { // set attributes, add to layer group and add to map
        color: "maroon",
        weight: 3
    }).addTo(plates);
    plates.addTo(myMap);

    d3.json(apiLink).then(function (earthquakeData) {
        console.log(earthquakeData); // data object contains unnecessary information

        L.geoJSON(earthquakeData.features, {
            pointToLayer: addMarker, //function below
            onEachFeature: addPopup //function below
        }).addTo(earthquakes);

        earthquakes.addTo(myMap);

        function addPopup(feature, layer) {
            let place = feature.properties.place;
            let mag = feature.properties.mag;
            let dateString = new Date(feature.properties.time).toUTCString();
    
            popUp = `<div><strong>${place}</strong></div><hr><div><strong>time:</strong> ${dateString}</div><div><strong>magnitude:</strong> ${mag}</div>`;
            layer.bindPopup(popUp);
        }
    
        function addMarker(feature, latlng) { // creates a circle instead of default marker
            return L.circleMarker(latlng, {
                radius: ((+feature.properties.mag) - 3) ** 2, // + casts to number
                fillColor: getFillColor(+feature.geometry.coordinates[2]), // call getFillColor function
                color: "#000",
                weight: 1,
                opacity: .25,
                fillOpacity: .4
            });
        }
    });
});

// add a legend to the map
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (myMap) {
    console.log("creating legend");
    console.log(markerColors);
    div = L.DomUtil.create('div', 'info legend'), // start with legend formatting and title
        labels = ["<strong>Depth</strong><hr style='height:3px; color:rgb(60,90,180); background-color:rgb(60,90,180); margin: 5px 0px -8px 0px;'>"];

    markerColors.forEach((mColor) => {    // loop through our density intervals and generate a label with a colored square for each interval
        console.log(mColor);
        div.innerHTML +=
            labels.push( //write html for each legend item and store in labels array
                '<i style="background:' + getFillColor(mColor.range[0]) + '"></i> ' +
                mColor.range[0] + (mColor.range[1] ? '&ndash;' + mColor.range[1] + '<br>' : '+')
            );
    });
    div.innerHTML = labels.join('<br>');
    return div;
};
// add legend to map
legend.addTo(myMap);