// src/lib/types.ts

export interface Order {
  id: string;
  organizationId: string; // From V2
  weightKg: number;
  serviceDurationMin: number;
  latitude: number;
  longitude: number;
  address?: string;
  status: "UNASSIGNED" | "ASSIGNED" | "DELIVERED"; //default 'UNASSIGNED'
  routeId?: string; // From V3
}

export interface Vehicle {
  id: string;
  organizationId: string; // From V1
  name: string;
  capacityKg: number;
  startLat: number;
  startLon: number;
  startShiftMinutes: number;
  endShiftMinutes: number;
  address?: string;
  status?: "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE";
  // status?: "IDLE"; // To be considered in the future, but not currently defined in V1 SQL
}

export interface Route {
  id: string;
  organizationId: string; // From V3
  vehicleId?: string;
  vehicle?: Vehicle;
  status: string; // V3 defines this as VARCHAR(50)
  stops?: RouteStop[]; // Virtual field (list of orders in this route)
  orders?: RouteStop[]; // Optional field to hold assigned orders for easier access in the frontend
  // totalDistanceMeters?: number; // To be considered in the future, but not currently defined in V3 SQL
  // totalTimeMinutes?: number;    To be considered in the future, but not currently defined in V3 SQL
}

export interface Driver {
  id: string;
  name: string;
  licenseId: string;
  phone: string;
  homeBase: string;
  status: "AVAILABLE" | "ON_ROUTE" | "OFF_DUTY";
  assignedVehicle?: Vehicle;
  assignedVehicleId?: string;
  lastCheckIn?: string;
}

export type RouteStop =
  | Order
  | string
  | {
      id?: string;
      orderId?: string;
      latitude?: number;
      longitude?: number;
    };