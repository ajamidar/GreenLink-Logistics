"use client";

import { Order, Vehicle } from "@/lib/types";
import AddressDisplay from "@/components/orders/AddressDisplay";
import { Trash2 } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onDelete: (id: string) => void;
  assignedOrdersByVehicleId?: Map<string, Order[]>;
  assignedDriverByVehicleId?: Map<string, { name: string }>;
}

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  IN_TRANSIT: "bg-blue-100 text-blue-700 border-blue-200",
  MAINTENANCE: "bg-red-100 text-red-700 border-red-200",
};

export default function VehicleTable({
  vehicles,
  onDelete,
  assignedOrdersByVehicleId,
  assignedDriverByVehicleId,
}: VehicleTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
          <tr>
            <th className="px-6 py-3">License Plate</th>
            <th className="px-6 py-3">Capacity (kg)</th>
            <th className="px-6 py-3">Start Location</th>
            <th className="px-6 py-3">Driver</th>
            <th className="px-6 py-3">Assigned Orders</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                No vehicles found. Add one to get started.
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => {
              const status = vehicle.status ?? "AVAILABLE";
              const hasLocation =
                Number.isFinite(vehicle.startLat) && Number.isFinite(vehicle.startLon);
              const hasAddress = Boolean(vehicle.address && vehicle.address.trim());

              return (
                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">License Plate</div>
                    {vehicle.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Capacity</div>
                    {vehicle.capacityKg} kg
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Start Location</div>
                    {hasAddress ? (
                      <span className="truncate max-w-[260px] inline-block">
                        {vehicle.address}
                      </span>
                    ) : hasLocation ? (
                      <AddressDisplay lat={vehicle.startLat} lon={vehicle.startLon} />
                    ) : (
                      <span className="text-slate-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Driver</div>
                    {assignedDriverByVehicleId?.get(vehicle.id)?.name || "Unassigned"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Assigned Orders</div>
                    {assignedOrdersByVehicleId?.get(vehicle.id)?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {assignedOrdersByVehicleId
                          ?.get(vehicle.id)
                          ?.slice(0, 3)
                          .map((order) => (
                            <button
                              key={order.id}
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                            >
                              #{order.id.slice(0, 6)}
                            </button>
                          ))}
                        {assignedOrdersByVehicleId.get(vehicle.id)!.length > 3 ? (
                          <span className="text-xs text-slate-400">
                            +{assignedOrdersByVehicleId.get(vehicle.id)!.length - 3} more
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Status</div>
                    <span
                      className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        statusStyles[status] || "bg-slate-100 text-slate-600 border-slate-200"
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Actions</div>
                    <button
                      onClick={() => onDelete(vehicle.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-colors"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Order Details</h2>
              <p className="text-sm text-slate-500">Assigned order information.</p>
            </div>
            <div className="space-y-3 px-4 py-5 text-sm text-slate-700 sm:px-6">
              <div>
                <span className="text-slate-500">Order ID:</span> #{selectedOrder.id.slice(0, 8)}
              </div>
              <div>
                <span className="text-slate-500">Address:</span>{" "}
                {selectedOrder.address
                  ? selectedOrder.address
                  : `${selectedOrder.latitude.toFixed(4)}, ${selectedOrder.longitude.toFixed(4)}`}
              </div>
              <div>
                <span className="text-slate-500">Weight:</span> {selectedOrder.weightKg} kg
              </div>
              <div>
                <span className="text-slate-500">Service Time:</span> {selectedOrder.serviceDurationMin} min
              </div>
              <div>
                <span className="text-slate-500">Status:</span> {selectedOrder.status}
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
