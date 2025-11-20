mapboxgl.accessToken = 'pk.eyJ1Ijoib21paTEyMyIsImEiOiJjbWg5cjJiZXowcDhpMmtwdmU4N2I4Z3NqIn0.OLgjMvZXtL4emMs9Uzo6zw';

const path_there_url = "https://raw.githubusercontent.com/emilyma214-alt/thecaremap/refs/heads/main/data/path_there_tracks.geojson";

const path_back_url = "https://raw.githubusercontent.com/emilyma214-alt/thecaremap/refs/heads/main/data/path_back_tracks.geojson";

const styles = [
  'mapbox://styles/omii123/cmi43cczf007101stduel52sx', // your custom style
  'mapbox://styles/omii123/cmi47s77r001q01sthh680xqa'                   // alt base map
];

let currentStyleIndex = 0;

const map = new mapboxgl.Map({
  container: 'map',
  center: [-122.2590, 37.8013],
  style: styles[currentStyleIndex],
  zoom: 15
});

function addRouteLayers() {
  // avoid duplicates if style already has sources/layers with these ids
  if (map.getSource('path_there')) return;

  // THERE path
  map.addSource("path_there", {
    type: "geojson",
    data: path_there_url
  });

  map.addLayer({
    id: "path_there_glow",
    type: "line",
    source: "path_there",
    paint: {
      "line-color": "#f3c2a5",
      "line-width": 15,
      "line-opacity": 0.45,
      "line-blur": 2.5 
    }
  });

  map.addLayer({
    id: "path_there_line",
    type: "line",
    source: "path_there",
    paint: {
      "line-color": "#872d11",
      "line-width": 4,
      "line-opacity": 0.9
    }
  });

  // BACK path
  map.addSource("path_back", {
    type: "geojson",
    data: path_back_url
  });

  map.addLayer({
    id: "path_back_glow",
    type: "line",
    source: "path_back",
    paint: {
      "line-color": "#f3c2a5",
      "line-width": 15,
      "line-opacity": 0.35,
      "line-blur": 2.5 
    }
  });

  map.addLayer({
    id: "path_back_line",
    type: "line",
    source: "path_back",
    paint: {
      "line-color": "#872d11",
      "line-width": 4,
      "line-opacity": 0.8,
      //"line-dasharray": [1.5, 1.5]
    }
  });
}

// first time: when map loads
map.on("load", () => {
  addRouteLayers();
});

// 🔘 basemap toggle button
const toggleBtn = document.getElementById('basemap-toggle');

toggleBtn.addEventListener('click', () => {
  // flip index 0 <-> 1
  currentStyleIndex = (currentStyleIndex + 1) % styles.length;

  // swap base map style
  map.setStyle(styles[currentStyleIndex]);

  // when new style finishes loading, re-add the routes
  map.once('style.load', () => {
    addRouteLayers();
  });
});
