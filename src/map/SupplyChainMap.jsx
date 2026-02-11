import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createCustomIcon = (emoji, isActive) => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-10 h-10 rounded-full ${isActive ? 'bg-blue-500 shadow-lg shadow-blue-200 ring-4 ring-blue-100' : 'bg-white shadow-md border-2 border-slate-200'} text-xl">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const defaultLocations = [
  { name: "Vietnam (Yarn)", lat: 10.8231, lng: 106.6297, emoji: "🧶", stage: "yarn_sourcing" },
  { name: "Dongguan (Knitting)", lat: 23.0207, lng: 113.7518, emoji: "🧵", stage: "knitting" },
  { name: "Dongguan (Dyeing)", lat: 23.0489, lng: 113.7330, emoji: "🎨", stage: "dyeing" },
  { name: "Shenzhen Port", lat: 22.5431, lng: 114.0579, emoji: "🚢", stage: "shipping" },
  { name: "Hong Kong DC", lat: 22.3193, lng: 114.1694, emoji: "📦", stage: "delivered" },
];

export default function SupplyChainMap({ currentStage = "knitting", locations = defaultLocations, className }) {
  const currentIndex = defaultLocations.findIndex(l => l.stage === currentStage);
  
  // Create route lines
  const routeCoords = locations.map(loc => [loc.lat, loc.lng]);
  const completedRoute = routeCoords.slice(0, currentIndex + 1);
  const pendingRoute = routeCoords.slice(currentIndex);

  return (
    <div className={cn("rounded-2xl overflow-hidden shadow-lg", className)}>
      <MapContainer
        center={[18.5, 110]}
        zoom={4}
        style={{ height: "100%", width: "100%", minHeight: "300px" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Completed Route */}
        {completedRoute.length > 1 && (
          <Polyline
            positions={completedRoute}
            pathOptions={{ color: "#10b981", weight: 4, dashArray: null }}
          />
        )}
        
        {/* Pending Route */}
        {pendingRoute.length > 1 && (
          <Polyline
            positions={pendingRoute}
            pathOptions={{ color: "#94a3b8", weight: 3, dashArray: "10, 10" }}
          />
        )}
        
        {/* Location Markers */}
        {locations.map((location, index) => {
          const isActive = location.stage === currentStage;
          const isCompleted = index < currentIndex;
          
          return (
            <Marker
              key={location.name}
              position={[location.lat, location.lng]}
              icon={createCustomIcon(location.emoji, isActive)}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-slate-800">{location.name}</h4>
                  <p className={cn(
                    "text-sm mt-1",
                    isActive && "text-blue-600 font-medium",
                    isCompleted && "text-emerald-600",
                    !isActive && !isCompleted && "text-slate-500"
                  )}>
                    {isActive ? "🔵 In Progress" : isCompleted ? "✅ Completed" : "⏳ Pending"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}