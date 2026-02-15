// src/components/dashboard/Map.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Order, Route, Vehicle } from "@/lib/types";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import polyline from "@mapbox/polyline";

const createIcon = (color: string) => {
  const html = `
    <div style="
      width: 22px;
      height: 22px;
      background: ${color};
      border: 2px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
    "></div>
  `;
  return L.divIcon({ className: "", html, iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -11] });
};

const createVehicleIcon = () => {
  const html = `
    <div style="position: relative; width: 30px; height: 30px;">
      <div style="
        position: absolute;
        top: 1px;
        left: 1px;
        width: 28px;
        height: 28px;
        background: #eef2ff;
        border: 2px solid #6366f1;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(15, 23, 42, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4338ca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="7" width="14" height="10" rx="2" ry="2"></rect>
          <path d="M15 10h4l3 3v4h-7z"></path>
          <circle cx="6" cy="18" r="2"></circle>
          <circle cx="18" cy="18" r="2"></circle>
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({ className: "", html, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -12] });
};

const icons = {
  UNASSIGNED: createIcon("#ef4444"), 
  ASSIGNED: createIcon("#22c55e"),   
  VEHICLE: createVehicleIcon(),
};

interface MapProps {
  orders: Order[];
  routes?: Route[]; 
  vehicles?: Vehicle[];
}

export default function Map({ orders = [], routes = [], vehicles = [] }: MapProps) {
  const [isClient, setIsClient] = useState(false);
  const [routeGeometries, setRouteGeometries] = useState<globalThis.Map<string, [number, number][]>>(new globalThis.Map());
  const [mapKey, setMapKey] = useState(0);
  const defaultCenter: [number, number] = [40.7128, -74.0060];
  const orderById = new globalThis.Map(orders.map((order) => [String(order.id), order]));

  useEffect(() => {
    setIsClient(true);
    setMapKey((prev) => prev + 1);
  }, []);

  // Fetch road geometries from OSRM when routes change
  useEffect(() => {
    if (!isClient || routes.length === 0) return;

    const fetchRouteGeometries = async () => {
      const newGeometries = new globalThis.Map<string, [number, number][]>();

      for (const route of routes) {
        const points = route.stops || route.orders || [];
        if (points.length < 2) continue;

        const coordinates = points
          .map((stop) => {
            if (!stop) return null;
            if (typeof stop === "string") {
              const order = orderById.get(String(stop));
              return order ? [order.longitude, order.latitude] : null;
            }
            if (typeof stop === "object") {
              if (typeof stop.latitude === "number" && typeof stop.longitude === "number") {
                return [stop.longitude, stop.latitude];
              }
              const id = "id" in stop ? String(stop.id) : null;
              const orderId = "orderId" in stop ? String(stop.orderId) : null;
              const order = orderById.get(orderId || id || "");
              return order ? [order.longitude, order.latitude] : null;
            }
            return null;
          })
          .filter((coord): coord is [number, number] => Array.isArray(coord));

        if (coordinates.length < 2) continue;

        try {
          // OSRM format: lon,lat;lon,lat;...
          const coordString = coordinates.map(c => `${c[0]},${c[1]}`).join(";");
          const response = await fetch(
            `http://localhost:5000/route/v1/driving/${coordString}?overview=full&geometries=polyline`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.routes && data.routes[0] && data.routes[0].geometry) {
              // Decode polyline geometry
              const decoded = polyline.decode(data.routes[0].geometry);
              newGeometries.set(route.id, decoded as [number, number][]);
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch route geometry for ${route.id}:`, error);
        }
      }

      setRouteGeometries(newGeometries);
    };

    fetchRouteGeometries();
  }, [routes, isClient, orderById]);

  if (!isClient) {
    return (
      <div className="h-full w-full rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-slate-100" />
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-slate-300 shadow-sm relative z-0">
      
      {/* Legend */}
      <div className="absolute left-3 bottom-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
          <span>Unassigned</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
          <span>Assigned</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-white"></span>
          <span>Vehicle</span>
        </div>
        {routes.length > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-1 w-4 bg-blue-600"></span>
            <span>Route</span>
          </div>
        )}
      </div>

      <MapContainer key={mapKey} center={defaultCenter} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 1. DRAW ROUTES (LINES) - Following actual roads via OSRM */}
        {routes.map((route) => {
           // Use OSRM geometry if available, otherwise fall back to straight lines
           const geometry = routeGeometries.get(route.id);
           
           if (geometry && geometry.length > 0) {
             return (
               <Polyline 
                 key={route.id} 
                 positions={geometry} 
                 pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8, lineJoin: 'round' }} 
               />
             );
           }

           // Fallback: Draw straight lines if OSRM geometry not available yet
           const points = route.stops || route.orders || [];
           if (points.length === 0) return null;

           const routeCoordinates = points
             .map((stop) => {
               if (!stop) return null;
               if (typeof stop === "string") {
                 const order = orderById.get(String(stop));
                 return order ? ([order.latitude, order.longitude] as [number, number]) : null;
               }

               if (typeof stop === "object") {
                 const hasCoords =
                   typeof stop.latitude === "number" &&
                   typeof stop.longitude === "number" &&
                   Number.isFinite(stop.latitude) &&
                   Number.isFinite(stop.longitude);

                 if (hasCoords) {
                   return [stop.latitude, stop.longitude] as [number, number];
                 }

                 const id = "id" in stop && stop.id ? String(stop.id) : null;
                 const orderId = "orderId" in stop && stop.orderId ? String(stop.orderId) : null;
                 const order = orderById.get(orderId || id || "");

                 return order ? ([order.latitude, order.longitude] as [number, number]) : null;
               }

               return null;
             })
             .filter((coord): coord is [number, number] => Array.isArray(coord));

           if (routeCoordinates.length === 0) return null;

           return (
             <Polyline 
               key={route.id} 
               positions={routeCoordinates} 
               pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8, lineJoin: 'round' }} 
             />
           );
        })}

        {/* 2. DRAW MARKERS (DOTS) */}
        {orders.map((order) => (
          <Marker 
            key={order.id} 
            position={[order.latitude, order.longitude]}
            icon={order.status === "ASSIGNED" ? icons.ASSIGNED : icons.UNASSIGNED}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">Order #{order.id.substring(0, 6)}</p>
                <p>Weight: {order.weightKg}kg</p>
                <p>Status: {order.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {vehicles
          .filter((vehicle) => Number.isFinite(vehicle.startLat) && Number.isFinite(vehicle.startLon))
          .map((vehicle) => (
            <Marker
              key={`vehicle-${vehicle.id}`}
              position={[vehicle.startLat, vehicle.startLon]}
              icon={icons.VEHICLE}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">Vehicle {vehicle.name}</p>
                  <p>Capacity: {vehicle.capacityKg}kg</p>
                  <p>Status: {vehicle.status || "AVAILABLE"}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}