// navigation.js

// Building coordinates, same as in your HTML options (adjust if needed)
const buildingLocations = {
  "Aboriginal Education Centre (Building 1S, Level 1)": { lat: -38.31215, lng: 146.42988 },
  "Auditorium (Building 3E)": { lat: -38.31093, lng: 146.43044 },
  "Bistro (Building 2N)": { lat: -38.31136, lng: 146.42903 },
  "Bookshop (Building 4N, Level 1)": { lat: -38.31101, lng: 146.42844 },
  "Cafeteria (Building 2N)": { lat: -38.31136, lng: 146.42903 },
  "Centre for Gippsland Studies (Building 1E, Level 1)": { lat: -38.31101, lng: 146.42939 },
  "CLIPP (Building 1E, Level 1)": { lat: -38.31101, lng: 146.42939 },
  "Chaplain (Building 3N)": { lat: -38.31101, lng: 146.42898 },
  "Clubs and Societies Space (Building 1E, Level 1)": { lat: -38.31101, lng: 146.42939 },
  "Commercial Services Centre (Building 4N, Level 1)": { lat: -38.31101, lng: 146.42844 },
  "Crofton Hatsell Room (Building 2W, Level 2)": { lat: -38.31190, lng: 146.42886 },
  "Fedliving Office (Building 4N, Level 1)": { lat: -38.31101, lng: 146.42844 },
  "GHERG (Building 4W)": { lat: -38.31250, lng: 146.42779 },
  "Kurnai College (Building 5W/6W)": { lat: -38.31223, lng: 146.42689 },
  "Gippsland Enterprise Centre (Building 9N)": { lat: -38.30931, lng: 146.42564 },
  "Gippsland Centre for Arts and Design (Building 6S, Level 1)": { lat: -38.31353, lng: 146.43143 },
  "Grounds Department (Building 5S)": { lat: -38.31368, lng: 146.43082 },
  "Hexagon Theatre (Building 1S, Level 1)": { lat: -38.31218, lng: 146.42991 },
  "ITS Services (Building 1E, Level 2)": { lat: -38.31101, lng: 146.42939 },
  "Leisure Centre (Building LC)": { lat: -38.31146, lng: 146.42514 },
  "Library (Building 1E, Level 1)": { lat: -38.31101, lng: 146.42939 },
  "Link Meeting Room (Building 2W, Level 2)": { lat: -38.31190, lng: 146.42886 },
  "Main Entrance (Building 1W, Level 2)": { lat: -38.31196, lng: 146.42947 },
  "Monash Rural Health (Building 3W, Level 2)": { lat: -38.31223, lng: 146.42855 },
  "Parenting Rooms (Building 1N, Level 1 / 1E, Level 1)": { lat: -38.31127, lng: 146.42947 },
  "Property and Infrastructure (Building 3W)": { lat: -38.31223, lng: 146.42855 },
  "Quiet Space / Prayer Room (Building 1N, Level 1)": { lat: -38.31167, lng: 146.42954 },
  "Logistics and Mail Room (Building 4N)": { lat: -38.31101, lng: 146.42844 },
  "Research and Innovation (Building 2W, Level 2)": { lat: -38.31190, lng: 146.42886 },
  "Student Experience (Building 3N)": { lat: -38.31100, lng: 146.42898 },
  "Student HQ (Building 1S, Level 2, Room 203)": { lat: -38.31218, lng: 146.42991 },
  "Student Lounge (Building 3N)": { lat: -38.31101, lng: 146.42898 },
  "Student Residences – Hall A (HA)": { lat: -38.31111, lng: 146.42597 },
  "Student Residences – Hall B (HB)": { lat: -38.31314, lng: 146.42653 },
  "North Residences (Building 7N)": { lat: -38.31042, lng: 146.42880 },
  "South Residences (South Res)": { lat: -38.31496, lng: 146.42883 },
  "West Residences (West Res)": { lat: -38.31451, lng: 146.42576 },
  "Student Senate Office (Building 3N)": { lat: -38.31100, lng: 146.42897 },
  "Switchback Gallery (Building 6S)": { lat: -38.31353, lng: 146.43143 },
};

// Haversine formula to calculate distance (meters)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Build graph: connect buildings within threshold meters
function buildGraph(buildings, threshold = 80) {
  const graph = {};
  const names = Object.keys(buildings);
  for (let i = 0; i < names.length; i++) {
    const from = names[i];
    graph[from] = {};
    for (let j = 0; j < names.length; j++) {
      if (i === j) continue;
      const to = names[j];
      const dist = haversineDistance(
        buildings[from].lat, buildings[from].lng,
        buildings[to].lat, buildings[to].lng
      );
      if (dist <= threshold) {
        graph[from][to] = dist;
      }
    }
  }
  return graph;
}

// Dijkstra's shortest path
function dijkstra(graph, start, end) {
  const distances = {};
  const previous = {};
  const queue = new Set(Object.keys(graph));

  for (let node of queue) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;

  while (queue.size > 0) {
    let currentNode = null;
    let minDist = Infinity;
    for (let node of queue) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        currentNode = node;
      }
    }

    if (currentNode === end || minDist === Infinity) break;
    queue.delete(currentNode);

    for (const neighbor in graph[currentNode]) {
      if (!queue.has(neighbor)) continue;
      const alt = distances[currentNode] + graph[currentNode][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentNode;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let u = end;
  while (u) {
    path.unshift(u);
    u = previous[u];
  }
  if (path[0] !== start) return null;
  return path;
}

// Wait for DOM and Leaflet to be ready
window.addEventListener('load', () => {
  // Grab your existing map
  const map = window.map; // You created map as global in your HTML script, right?

  if (!map) {
    console.error('Map not found! Make sure your map is global in HTML.');
    return;
  }

  // Build graph (80m threshold)
  const pathGraph = buildGraph(buildingLocations, 80);

  // Add building markers to map for visual (optional)
  const markers = {};
  for (const [name, coords] of Object.entries(buildingLocations)) {
    markers[name] = L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(name);
  }

  // Track currently drawn route so we can remove it
  let routeLine = null;

  // Handle the "Search" button click
  document.querySelector('.nav button[onclick="generateRoute()"]').addEventListener('click', e => {
    e.preventDefault();
    const start = document.getElementById('start').value;
    const end = document.getElementById('destination').value;

    if (!start || !end) {
      alert('Please select both start and destination.');
      return;
    }
    if (start === end) {
      alert('Start and destination are the same.');
      return;
    }

    const path = dijkstra(pathGraph, start, end);
    if (!path) {
      alert('No route found between the selected buildings.');
      return;
    }

    // Convert path to latlng for polyline
    const latlngs = path.map(name => [buildingLocations[name].lat, buildingLocations[name].lng]);

    // Remove old route line if present
    if (routeLine) {
      map.removeLayer(routeLine);
    }

    // Draw new route
    routeLine = L.polyline(latlngs, { color: 'blue', weight: 5 }).addTo(map);

    // Zoom map to route bounds
    map.fitBounds(routeLine.getBounds());

    // Open popup on start marker
    if (markers[start]) markers[start].openPopup();
  });
});ds(window.currentRouteLine.getBounds());
  });
}

