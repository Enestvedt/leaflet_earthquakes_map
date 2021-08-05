const api_link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

var myMap = L.map("map", {
    center: [13.6929, -89.2182],
    zoom: 3
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
}).addTo(myMap);

d3.json(api_link).then(function (data) {
    console.log(data);
    // Creating a GeoJSON layer with the retrieved data
    createMap(data);
});

function createMap(data) {
    L.geoJson(data, {
        pointToLayer: addMarker,
        onEachFeature: addPopup
    }).addTo(myMap);
}

const markerColors = [
    { range: [-10, 10], name: "Green", markerColor: "rgb(150,250,4)" },
    { range: [10, 30], name: "Light Green", markerColor: "rgb(212,246,11)" },
    { range: [30, 50], name: "Light Orange", markerColor: "rgb(244,214,18)" },
    { range: [50, 70], name: "Dark Orange", markerColor: "rgb(251,169,33)" },
    { range: [70, 90], name: "Light Red", markerColor: "rgb(249,145,76)" },
    { range: [90], name: "Red", markerColor: "rgb(251,65,79)" }
];

// look up the color in and return it - I used a ternary operator to handle the case of the top range - dope!!
function getFillColor(value) {
    let myIndex = markerColors.findIndex(v => (v.range[1]? value >= v.range[0] && value <= v.range[1]: value >= v.range[0]));
    console.log(`${value}:  ${myIndex}`);
    return markerColors[myIndex].markerColor;
}


function addMarker(feature, latlng) {
    return L.circleMarker(latlng, {
        radius: ((+feature.properties.mag) -3) ** 2, // + casts to number
        fillColor: getFillColor(+feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: .25,
        fillOpacity: .4
    });
}

function addPopup(feature, layer) {
    let place = feature.properties.place;
    let mag = feature.properties.mag;
    let time = feature.properties.time;

    let dateString = new Date(time).toUTCString();
    popUp = `<div>${place}</div><hr><div>time: ${dateString}</div><div>magnitude: ${mag}</div>`;
    layer.bindPopup(popUp);
}

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        labels = ["<strong>Depth</strong><hr style='height:3px; color:rgb(60,90,180); background-color:rgb(60,90,180); margin: 5px 0px -8px 0px;'>"];

    // loop through our density intervals and generate a label with a colored square for each interval
    markerColors.forEach((mColor) => {
        div.innerHTML +=
        labels.push(
            '<i style="background:' + getFillColor(mColor.range[0]) + '"></i> ' +
            mColor.range[0] + (mColor.range[1] ? '&ndash;' + mColor.range[1] + '<br>' : '+')
        );
        }
    );
    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(myMap);