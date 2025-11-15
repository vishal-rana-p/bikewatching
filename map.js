// Import Mapbox as an ESM module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoidmlzaGFscmFuYXAiLCJhIjoiY21oemxxYWZ4MGJ1NjJrcHpja296NnZlNiJ9.3iM4IUIQy74n0xSuxugUYQ';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div where the map will render
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom level
  minZoom: 5, // Minimum allowed zoom
  maxZoom: 18, // Maximum allowed zoom
});

// helper function to creat SVG coordinates from lon/lat
function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.lon, +station.lat); // Convert lon/lat to Mapbox LngLat
    const { x, y } = map.project(point); // Project to pixel coordinates
    return { cx: x, cy: y }; // Return as object for use in SVG attributes
  }

map.on('load', async () => {
    console.log("Map is fully loaded.");
  
    // Add a GeoJSON data source from Boston Open Data
    map.addSource('boston_route', {
      type: 'geojson',
      data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
    });
  
    console.log("Boston bike network source added.");

    map.addLayer({
        id: 'bike-lanes',
        type: 'line',
        source: 'boston_route',
        paint: {
            'line-color': '#4285F4',  // A bright green using hex code
            'line-width': 5,          // Thicker lines
            'line-opacity': 0.4       // Slightly less transparent
          },
      });

    //   cambridge
    map.addSource('cambridge_route', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
      });
      
      map.addLayer({
        id: 'cambridge-bike-lanes',
        type: 'line',
        source: 'cambridge_route',
        paint: {
          'line-color': '#34A853',
          'line-width': 3,
          'line-opacity': 0.4,
        },
      });



      //previous code
    let jsonData;
    try {
      const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
      const svg = d3.select('#map').select('svg');
      // Await JSON fetch
      const jsonData = await d3.json(jsonurl);
  
      let stations = jsonData.data.stations;
      // Append circles to the SVG for each station
    const circles = svg
    .selectAll('circle')
    .data(stations)
    .enter()
    .append('circle')
    .attr('r', 5) // Radius of the circle
    .attr('fill', 'steelblue') // Circle fill color
    .attr('stroke', 'white') // Circle border color
    .attr('stroke-width', 1) // Circle border thickness
    .attr('opacity', 0.8); // Circle opacity

    // Function to update circle positions when the map moves/zooms
    function updatePositions() {
        circles
        .attr('cx', (d) => getCoords(d).cx) // Set the x-position using projected coordinates
        .attr('cy', (d) => getCoords(d).cy); // Set the y-position using projected coordinates
    }
    
    // Initial position update when map loads
    updatePositions();

    // Reposition markers on map interactions
    map.on('move', updatePositions); // Update during map movement
    map.on('zoom', updatePositions); // Update during zooming
    map.on('resize', updatePositions); // Update on window resize
    map.on('moveend', updatePositions); // Final adjustment after movement ends

    } catch (error) {
      console.error('Error loading JSON:', error); // Handle errors
    }
  });

