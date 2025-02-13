
// Step 1: CREATE THE BASE LAYERS
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});




let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
let tectonicURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json';

  // This function determines the color of the marker based on the depth of the earthquake.
function getColor(depth) {
  let color = 'white';
  if (depth > 90) {
    color = "#ea2c2c";
  } else if (depth > 70) {
    color = "#ea822c";
  } else if (depth > 50) {
    color = "#ee9c00";
  } else if (depth > 30) {
    color = "#eecc00";
  } else if (depth > 10) {
    color = "#d4ee00";
  } else {
    color = "#98ee00";
  }

  return color;
}

  // This function determines the radius of the earthquake marker based on its magnitude.
  //activity with country GDP is a good example here I can use 
//If I multiply the radius by something simple that should tell it to base radius of each input
function getRadius(magnitude) {
  let radius = 1;
  return magnitude * 5;
}

d3.json(queryUrl).then(function (data) {
  d3.json(tectonicURL).then(function (plateData) {


  // Step 2: CREATE THE DATA/OVERLAY LAYERS

    let quakeMarkers = [];

    for (let i = 0; i < data.features.length; i++) {
      let row = data.features[i];
      let location = row.geometry.coordinates;
      if (location) {
        let longitude = location[0];
        let latitude = location[1];
        let depth = location[2];
        let magnitude = row.properties.mag;
        
        let marker = L.circleMarker([latitude, longitude], {
          fillOpacity: 60,
          color: getColor(depth),
          fillColor: getColor(depth),
          radius: getRadius(magnitude)
        }).bindPopup(`<h2>${row.properties.title}</h2><hr><h3>Depth Level: ${depth}m</h3><hr><h3>Magnitude: ${magnitude}m</h3`);

        quakeMarkers.push(marker);

      }
    }

    let markerLayer = L.layerGroup(quakeMarkers);


    let geoLayer = L.geoJSON(plateData, {
      style: {
        color: 'grey',
        weight: 3
      }
    });

    // Step 3: CREATE THE LAYER CONTROL
    let baseMaps = {
      Street: street,
      Topography: topo
    };

    let overlayMaps = {
      Earthquakes: markerLayer,
      TectonicPlates: geoLayer
    };

    // Step 4: INITIALIZE THE MAP
    let myMap = L.map("map", {
      center: [18.4566, -66.7429],
      zoom: 3,
      layers: [street, markerLayer, geoLayer]
    });

    // Step 5: Add the Layer Control, Legend, Annotations as needed
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
    
    let legend = L.control({ position: 'bottom-right' });
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");

      let legendInfo = `<h3>Earthquake <br> Depth</h3>
      <i style="background:#98ee00"></i>-10-10<br>
      <i style="background:#d4ee00"></i>10-30<br>
      <i style="background:#eecc00"></i>30-50<br>
      <i style="background:#ee9c00"></i>50-70<br>
      <i style="background:#ea822c"></i>70-90<br>
      <i style="background:#ea2c2c"></i>90+`;

      div.innerHTML = legendInfo;

      return div;
    };

    legend.addTo(myMap);

  });
});

