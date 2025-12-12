mapboxgl.accessToken = 'pk.eyJ1Ijoib21paTEyMyIsImEiOiJjbWg5cjJiZXowcDhpMmtwdmU4N2I4Z3NqIn0.OLgjMvZXtL4emMs9Uzo6zw';

const path_there_url = "https://raw.githubusercontent.com/emilyma214-alt/thecaremap/refs/heads/main/data/path_there_tracks.geojson";

const path_back_url = "https://raw.githubusercontent.com/emilyma214-alt/thecaremap/refs/heads/main/data/path_back_tracks.geojson";

const points_url = "https://raw.githubusercontent.com/emilyma214-alt/thecaremap/refs/heads/main/data/Locations.geojson";

const viewpoints_url = "https://raw.githubusercontent.com/emilyma214-alt/thecaremap/refs/heads/main/data/viewpoints.geojson";

const viewpoint_icon_url = "https://raw.githubusercontent.com/emilyma214-alt/thecaremap/main/photos/viewpoint.png";

const styles = [
  'mapbox://styles/omii123/cmi47s77r001q01sthh680xqa', 
  'mapbox://styles/omii123/cmi43cczf007101stduel52sx'                  // alt base map
];

let currentStyleIndex = 0;

const map = new mapboxgl.Map({
  container: 'map',
  center: [-122.2590, 37.8013],
  style: styles[currentStyleIndex],
  zoom: 15
});

function addRouteLayers() {
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

  map.addSource("care_points", {
    type: "geojson",
    data: points_url
  });


  map.addLayer({
    id: "care_points_circle",
    type: "circle",
    source: "care_points",
    paint: {
      "circle-color": [
      "match",
      ["get", "Category"],
      "Start and End", "#872d11",   
      "Main Stop",   "#1a2358",    
      "Small Stop",  "#5d67a1",     
      "#aaaaaa"
    ],
    "circle-radius": [
      "match",
      ["get", "Category"],
      "Start and End", 8,
      "Main Stop",     7,
      "Small Stop",    5,
       5
    ],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff"
    }
  });
}

function addViewpointLayers() {
  if (map.getSource("viewpoints")) return;

  map.loadImage(viewpoint_icon_url, (error, image) => {
    if (error) {
      console.error("Error loading viewpoint icon:", error);
      return;
    }

    if (!map.hasImage("viewpoint-icon")) {
      map.addImage("viewpoint-icon", image);
    }

    map.addSource("viewpoints", {
      type: "geojson",
      data: viewpoints_url
    });

    map.addLayer({
      id: "viewpoints_base",
      type: "circle",
      source: "viewpoints",
      paint:{
        'circle-color': "#decccc",
        'circle-radius': 7.5,
        'circle-opacity': 0.8
      }
    });

    map.addLayer({
      id: "viewpoints_symbol",
      type: "symbol",
      source: "viewpoints",
      layout: {
        "icon-image": "viewpoint-icon",
        "icon-size": 0.11,
        "icon-allow-overlap": true
      }
    });

    // 👉 shared popup helper
    let vpPopup;
    const isTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    function showViewpointPopup(e) {
      const feature = e.features[0];
      const coords  = feature.geometry.coordinates.slice();
      const props   = feature.properties || {};
      const name    = props.Name || "Viewpoint";

      const imgA = (props.Image_A || "").trim();
      const imgB = (props.Image_B || "").trim();
      const imgC = (props.Image_C || "").trim();

      const imgs = [imgA, imgB, imgC].filter(Boolean);
      const imgCount = imgs.length || 1;
      const popupWidth = Math.max(170, 170 * imgCount);

      const vhtml = `
        <div class="viewpoint-popup" style="width:${popupWidth}px">
          <h3 class="vp-title">${name}</h3>
          <div class="viewpoint-images">
            ${imgA ? `<img src="${imgA}" />` : ""}
            ${imgB ? `<img src="${imgB}" />` : ""}
            ${imgC ? `<img src="${imgC}" />` : ""}
          </div>
        </div>
      `;

      if (vpPopup) vpPopup.remove();

      vpPopup = new mapboxgl.Popup({
        closeButton: true,
        offset: 12,
        className: "viewpoint-popup"
      })
        .setLngLat(coords)
        .setHTML(vhtml)
        .addTo(map);
    }

    function hideViewpointPopup() {
      if (vpPopup) {
        vpPopup.remove();
        vpPopup = null;
      }
    }

    if (isTouch) {
      // 📱 mobile/tablet: use tap/click
      map.on("click", "viewpoints_symbol", (e) => {
        showViewpointPopup(e);
      });
    } else {
      // 🖥 desktop: keep hover behavior
      map.on("mouseenter", "viewpoints_symbol", (e) => {
        map.getCanvas().style.cursor = "pointer";
        showViewpointPopup(e);
      });

      map.on("mouseleave", "viewpoints_symbol", () => {
        map.getCanvas().style.cursor = "";
        hideViewpointPopup();
      });
    }
  });
}


// first time: when map loads
map.on("load", () => {
  addRouteLayers();
  addViewpointLayers();
  // popup on click
  map.on("click", "care_points_circle", (e) => {
    const feature = e.features[0];
    const props = feature.properties;

    const name      = props["Name"] || "Location";
    const shortDesc = props["Short_Description"] || "";
    const Desc_1  = props["Description_1"] || "";
    const Desc_2  = props["Description_2"] || "";
    const img1      = (props["Image_1"] || "").trim();
    const img2      = (props["image_2"] || "").trim();

    
  
// ${imagesHtml ? `<div class="popup-images">${imagesHtml}</div>` : ""}
    const html = `
      <div class="popup-content">
        <h3 class="popup-title">${name}</h3>
        ${shortDesc ? `<p class="popup-short">${shortDesc}</p>` : ""}
        ${Desc_1 ? `<p class="popup-long">${Desc_1}</p>` : ""}
        ${props.Image_1 ? `<img class="popup-image" src="${props.Image_1}" />` : ""}
        
        ${Desc_2 ? `<p class="popup-long">${Desc_2}</p>` : ""}
        ${props.image_2 ? `<img class="popup-image" src="${props.image_2}" />` : ""}
      </div>
    `;

    new mapboxgl.Popup()
      .setLngLat(feature.geometry.coordinates)
      .setHTML(html)
      .addTo(map);
  });

  // change cursor on hover
  map.on("mouseenter", "care_points_circle", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "care_points_circle", () => {
    map.getCanvas().style.cursor = "";
  });
});


// basemap toggle button
const toggleBtn = document.getElementById('basemap-toggle');

toggleBtn.addEventListener('click', () => {
  // flip index 0 <-> 1
  currentStyleIndex = (currentStyleIndex + 1) % styles.length;

  // swap base map style
  map.setStyle(styles[currentStyleIndex]);

  // when new style finishes loading, re-add the routes
  map.once('style.load', () => {
    addRouteLayers();
    addViewpointLayers();
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const infoBox   = document.getElementById("info-box");
  const infoBody  = document.getElementById("info-body");
  const infoToggle = document.getElementById("info-toggle");

  if (infoBox && infoBody && infoToggle) {
    infoToggle.addEventListener("click", () => {
      const isCollapsed = infoBox.classList.toggle("collapsed");
      infoToggle.textContent = isCollapsed ? "+" : "−";
      infoToggle.setAttribute("aria-expanded", String(!isCollapsed));
      infoToggle.title = isCollapsed ? "Show description" : "Hide description";
    });
  }
  const audioEl = document.getElementById("tom-audio");
  const btnEl   = document.getElementById("interview-button");

  if (audioEl && btnEl) {
    btnEl.addEventListener("click", () => {
      if (audioEl.paused) {
        audioEl.play().catch(err => {
        console.error("Audio play error:", err);
      });
        btnEl.textContent = "⏸ Pause Tom's interview";
      } else {
        audioEl.pause();
        btnEl.textContent = "▶ Listen to Tom talk about Lake Lunches";
      }
    });

    // when audio finishes, reset button text
    audioEl.addEventListener("ended", () => {
      btnEl.textContent = "▶ Listen to Tom talk about Lake Lunches";
    });
  }
  
});
