// Referenced Sam Zeigler's code and class examples to complete the assignment

// Initialize and Create LayerGroup
var earthquakes = new L.LayerGroup();

// From https://leafletjs.com/reference-1.7.1.html#tilelayer
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
    });

// Define baseMaps Object for Base Layers
var baseMaps = {
    "Lightmap": lightmap,
};

// Create Overlay Object for Overlay Layers
var overlayMaps = {
    "Earthquakes": earthquakes,
};

// Create the Map
var myMap = L.map("mapid", {
    center: [38, -94],
    zoom: 4.25,
    layers: [lightmap, earthquakes]
});

// Create a Layer Control
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// Retrieve earthquakesURL using D3
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(earthquakeData) {
    console.log(earthquakeData);
    // Function to determine marker color
    var colors = ["#34eb3d", "#80eb34", "#d3eb34", "#edc10e", "#eb8934", "#ed0e0e"]
	var limits = [10, 30, 50, 70, 90];
    function color(depth) {
		for(i = 0; i < limits.length; i++ ){
			if(depth < limits[i]){
				return colors[i];
			}
		}
		return colors[5]
    }
    // Function to determine marker style
    function styleInfo(feature) {
        return {
            opacity: 1, 
            fillOpacity: 1,
            fillColor: color(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: 5 * feature.properties.mag,
            stroke: true,
            weight: 0.5
        };
    }
    // Use GeoJSON to add layers of circles and popups
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +
            "</h3><h3>Depth: " + feature.geometry.coordinates[2] + "</h3><hr><p>" + feature.properties.place + "<p>");
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);

    // Legend Setup
    var limitsText = ["Less than 10", "10 to 30", "30 to 50", "50 to 70", "70 to 90", "90 or Greater"];

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var labels = [];

        var legendInfo = "<u1 class=\"labels\">";

		//I hate how you can't iterate through an array directly, you have to "from zero to length"
        for (i=0; i < limitsText.length; i++) {
            labels.push(
                "<li style=\"background-color: " + colors[i] + "\"></li" + "div class=\labels\">" + limitsText[i] + "</div>"
            );
        }
        
        legendInfo = legendInfo + "</u1>";
        div.innerHTML = legendInfo;

        div.innerHTML += "<u1>" + labels.join("") + "</u1>";
        return div;
    };
    
    // Add legend to map
    legend.addTo(myMap);
});