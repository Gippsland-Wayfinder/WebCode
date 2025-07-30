// ======== 1. Building Coordinates ========
const buildingLocations = {
  "Library (Building 1E, Level 1)": { lat: -38.3121, lng: 146.4275 },
  "Student HQ (Building 1S, Level 2, Room 203)": { lat: -38.3130, lng: 146.4288 },
  "Bookshop (Building 4N, Level 1)": { lat: -38.3113, lng: 146.4267 },
  "ITS Services (Building 1E, Level 2)": { lat: -38.3122, lng: 146.4276 },
  "Bistro (Building 2N)": { lat: -38.3114, lng: 146.4281 },
  "Hexagon Theatre (Building 1S, Level 1)": { lat: -38.3133, lng: 146.4287 },
  "Student Lounge (Building 3N)": { lat: -38.3117, lng: 146.4284 },
  "Switchback Gallery (Building 6S)": { lat: -38.3142, lng: 146.4282 },
  // Add more buildings with lat/lng as needed
};

// ======== 2. Walking Path Network (Graph) ========
const pathGraph = {
  A: { coords: [-38.3114, 146.4275], neighbors: { B: 40, C: 70 } },
  B: { coords: [-38.3122, 146.4275], neighbors: { A: 40, D: 60 } },
  C: { coords: [-38.3115, 146.4282], neighbors: { A: 70, D: 50 } },
  D: { coords: [-38.3125, 146.4282], neighbors: { B: 60, C: 50, E: 40 } },
  E: { coords: [-38.3133, 146.4288], neighbors: { D: 40 } }
};

// Map buildings to nearest node in graph
const buildingToNode = {
  "Bookshop (Building 4N, Level 1)": "A",
  "ITS Services (Building 1E, Level 2)": "B",
  "Bistro (Building 2N)": "C",
  "Student Lounge (Building 3N)": "C",
  "Library (Building 1E, Level 1)": "B",
  "Hexagon Theatre (Building 1S, Level 1)": "E",
  "Student HQ (Building 1S, Level 2, Room 203)": "E",
  "Switchback Gallery (Building 6S)": "E"
};

// ======== 3. Dijkstra's Algorithm ========
function dijkstra(startNode, endNode) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(pathGraph));

  Object.keys(pathGraph).forEach(node => {
    distances[node] = Infinity;
  });
  distances[startNode] = 0;

  while (unvisited.size) {
    let closest = null;
    for (let node of unvisited) {
      if (closest === null || distances[node] < distances[closest]) {
        closest = node;
      }
    }

    if (closest === endNode) break;

    unvisited.delete(closest);

    const neighbors = pathGraph[closest].neighbors;
    for (let neighbor in neighbors) {
      const alt = distances[closest] + neighbors[neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = closest;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = endNode;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }
  return path.map(node => pathGraph[node].coords);
}

// ======== 4. Route Drawing and Integration ========
function drawRoute(startBuilding, endBuilding) {
  const startNode = buildingToNode[startBuilding];
  const endNode = buildingToNode[endBuilding];

  if (!startNode || !endNode) {
    alert("No path found for selected buildings.");
    return;
  }

  const routeCoords = dijkstra(startNode, endNode);

  if (typeof L === 'undefined') {
    console.error("Leaflet map not found.");
    return;
  }

  // Draw on the map
  if (window.currentRouteLine) {
    map.removeLayer(window.currentRouteLine);
  }

  window.currentRouteLine = L.polyline(routeCoords, {
    color: 'red',
    weight: 6,
    opacity: 0.8
  }).addTo(map);

  map.fitBounds(window.currentRouteLine.getBounds());
}

// ======== 5. Hook into Dropdown Selections (Optional) ========
document.getElementById("start").addEventListener("change", maybeDrawRoute);
document.getElementById("destination").addEventListener("change", maybeDrawRoute);

function maybeDrawRoute() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("destination").value;
  if (start && end) {
    drawRoute(start, end);
  }
}
