"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Users, Radio, ShieldCheck } from "lucide-react";
import { Driver, Vehicle } from "@/lib/types";
import DriverTable from "@/components/drivers/DriverTable";
import NewDriverModal from "@/components/drivers/NewDriverModal";
import { fetchDrivers, createDriver, deleteDriver, fetchVehicles, updateDriver } from "@/lib/api";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const [driverData, vehicleData] = await Promise.all([
        fetchDrivers(),
        fetchVehicles(),
      ]);
      setDrivers(driverData);
      setVehicles(vehicleData);
      setError(null);
    } catch (err) {
      setError("Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = drivers.length;
    const available = drivers.filter((driver) => driver.status === "AVAILABLE").length;
    const onRoute = drivers.filter((driver) => driver.status === "ON_ROUTE").length;
    const offDuty = drivers.filter((driver) => driver.status === "OFF_DUTY").length;

    return { total, available, onRoute, offDuty };
  }, [drivers]);

  const handleCreateDriver = (payload: {
    name: string;
    email: string;
    phone: string;
    licenseId: string;
    homeBase: string;
    status: Driver["status"];
    assignedVehicleId?: string;
  }) => {
    setIsSubmitting(true);
    createDriver({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      licenseId: payload.licenseId,
      homeBase: payload.homeBase,
      status: payload.status,
      assignedVehicleId: payload.assignedVehicleId,
    })
      .then((created) => {
        setDrivers((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setError(null);
      })
      .catch(() => {
        setError("Failed to create driver.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteDriver = (id: string) => {
    if (!confirm("Delete this driver?")) return;
    deleteDriver(id)
      .then(() => {
        setDrivers((prev) => prev.filter((driver) => driver.id !== id));
      })
      .catch(() => {
        setError("Failed to delete driver.");
      });
  };

  const handleUpdateDriver = (id: string, payload: {
    status?: Driver["status"];
    assignedVehicleId?: string | null;
  }) => {
    return updateDriver(id, payload)
      .then((updated) => {
        setDrivers((prev) => prev.map((driver) => (driver.id === id ? updated : driver)));
        return updated;
      })
      .catch((error) => {
        setError("Failed to update driver.");
        throw error;
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driver Management</h1>
          <p className="text-slate-500">Coordinate driver availability and assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          <Plus size={20} />
          Add Driver
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Total Drivers</span>
            <Users size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Available</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.available}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>On Route</span>
            <Radio size={18} className="text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.onRoute}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Off Duty</span>
            <Users size={18} className="text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{stats.offDuty}</div>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading drivers...</div>
      ) : (
        <DriverTable
          drivers={drivers}
          vehicles={vehicles}
          onDelete={handleDeleteDriver}
          onUpdate={handleUpdateDriver}
        />
      )}

      <NewDriverModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateDriver}
        vehicles={vehicles}
      />
    </div>
  );
}
