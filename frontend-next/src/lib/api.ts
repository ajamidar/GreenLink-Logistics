import axios from "axios";
import { Driver, Order, Route, Vehicle } from "./types";

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Custom API Functions 

export const fetchVehicles = async (): Promise<Vehicle[]> => {
    const response = await apiClient.get<Vehicle[]>('/vehicles');
    return response.data;
};

export const fetchOrders = async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
};

export const fetchRoutes = async (): Promise<Route[]> => {
    // Lets assume I have a GET /api/routes endpoint. 
    // If not, I can create one in Java later, or just return empty for now.
    try {
        const response = await apiClient.get<Route[]>('/routes');
        return response.data;
    } catch (error) {
        console.warn("Could not fetch routes", error);
        return [];
    }
};

export const optimizeRoutes = async (): Promise<Route[]> => {
    //Trigger Python solver via Java endpoint.
    const response = await apiClient.post<Route[]>('/routes/optimize');
    return response.data;
};

export async function deleteOrder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete order with id ${id}`);
    }
}

export async function createOrder(payload: {
    address?: string;
    latitude?: number;
    longitude?: number;
    weightKg: number;
    serviceDurationMin: number;
}): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', payload);
    return response.data;
}

export async function createVehicle(payload: {
    address?: string;
    capacityKg: number;
    endShiftMinutes: number;
    name: string;
    organizationId: string;
    startLat?: number;
    startLon?: number;
    startShiftMinutes: number;
    status?: Vehicle["status"];
}): Promise<Vehicle> {
    const response = await apiClient.post<Vehicle>('/vehicles', payload);
    return response.data;
}

export async function deleteVehicle(id: string): Promise<void> {
    const response = await apiClient.delete(`/vehicles/${id}`);
    if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Failed to delete vehicle with id ${id}`);
    }
}

export const fetchDrivers = async (): Promise<Driver[]> => {
    const response = await apiClient.get<Driver[]>('/drivers');
    return response.data;
};

export async function createDriver(payload: {
    name: string;
    licenseId: string;
    phone: string;
    homeBase: string;
    status: Driver["status"];
    assignedVehicleId?: string;
}): Promise<Driver> {
    const response = await apiClient.post<Driver>('/drivers', payload);
    return response.data;
}

export async function updateDriver(id: string, payload: {
    name?: string;
    licenseId?: string;
    phone?: string;
    homeBase?: string;
    status?: Driver["status"];
    assignedVehicleId?: string | null;
    lastCheckIn?: string | null;
}): Promise<Driver> {
    const response = await apiClient.put<Driver>(`/drivers/${id}`, payload);
    return response.data;
}

export async function deleteDriver(id: string): Promise<void> {
    const response = await apiClient.delete(`/drivers/${id}`);
    if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Failed to delete driver with id ${id}`);
    }
}