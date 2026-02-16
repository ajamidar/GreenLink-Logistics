"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Driver, Order, Route, Vehicle } from "@/lib/types";
import { fetchVehicles, createVehicle, deleteVehicle, fetchRoutes, fetchOrders, fetchDrivers } from "@/lib/api";
import VehicleTable from "@/components/vehicles/VehicleTable";
import NewVehicleModal from "@/components/vehicles/NewVehicleModal";

const DEFAULT_START_SHIFT = 480;
const DEFAULT_END_SHIFT = 1020;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const [vehicleData, routeData, orderData, driverData] = await Promise.all([
        fetchVehicles(),
        fetchRoutes(),
        fetchOrders(),
        fetchDrivers(),
      ]);
      setVehicles(vehicleData);
      setRoutes(routeData);
      setOrders(orderData);
      setDrivers(driverData);
      setError(null);
    } catch (err) {
      setError("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const assignedOrdersByVehicleId = useMemo(() => {
    const map = new Map<string, Order[]>();
    const orderLookup = new Map(orders.map((order) => [order.id, order]));
    for (const route of routes) {
      const vehicleId = route.vehicle?.id || route.vehicleId;
      if (!vehicleId) continue;
      const orders: Order[] = [];
      const stops = route.orders || route.stops || [];
      for (const stop of stops) {
        if (!stop) continue;
        if (typeof stop === "string") {
          const match = orderLookup.get(stop);
          if (match) orders.push(match);
          continue;
        }
        if (typeof stop === "object") {
          const id = "id" in stop ? stop.id : undefined;
          const orderId = "orderId" in stop ? stop.orderId : undefined;
          const resolvedId = orderId || id;
          if (resolvedId && orderLookup.has(String(resolvedId))) {
            orders.push(orderLookup.get(String(resolvedId))!);
            continue;
          }
          if ("latitude" in stop && "longitude" in stop) {
            orders.push(stop as Order);
          }
        }
      }
      if (orders.length > 0) {
        map.set(String(vehicleId), orders);
      }
    }
    return map;
  }, [routes, orders]);

  const assignedDriverByVehicleId = useMemo(() => {
    const map = new Map<string, Driver>();
    for (const driver of drivers) {
      const vehicleId = driver.assignedVehicle?.id || driver.assignedVehicleId;
      if (vehicleId) {
        map.set(String(vehicleId), driver);
      }
    }
    return map;
  }, [drivers]);

  const handleCreateVehicle = async (payload: {
    licensePlate: string;
    capacityKg: number;
    address: string;
  }) => {
    try {
      setIsSubmitting(true);
      const created = await createVehicle({
        name: payload.licensePlate,
        capacityKg: payload.capacityKg,
        address: payload.address,
        startShiftMinutes: DEFAULT_START_SHIFT,
        endShiftMinutes: DEFAULT_END_SHIFT,
      });
      setVehicles((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      setError("Failed to create vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
    } catch (err) {
      setError("Failed to delete vehicle.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicle Management</h1>
          <p className="text-slate-500">Track your fleet and update availability.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading vehicles...</div>
      ) : (
        <VehicleTable
          vehicles={vehicles}
          onDelete={handleDeleteVehicle}
          assignedOrdersByVehicleId={assignedOrdersByVehicleId}
          assignedDriverByVehicleId={assignedDriverByVehicleId}
        />
      )}

      <NewVehicleModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateVehicle}
      />
    </div>
  );
}
