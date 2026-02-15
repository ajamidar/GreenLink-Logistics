"use client";

import { Order, Vehicle } from "@/lib/types";
import { Trash2 } from "lucide-react";
import AddressDisplay from "@/components/orders/AddressDisplay";
import { useState } from "react";

interface OrderTableProps {
  orders: Order[];
  onDelete: (id: string) => void;
  assignedVehicleByOrderId?: Map<string, Vehicle>;
}

export default function OrderTable({ orders, onDelete, assignedVehicleByOrderId }: OrderTableProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
          <tr>
            <th className="px-6 py-3">Order ID</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Weight</th>
            <th className="px-6 py-3">Vehicle</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                No orders found. Add one to get started.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="text-[11px] uppercase text-slate-400 sm:hidden">Order ID</div>
                  #{order.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="text-[11px] uppercase text-slate-400 sm:hidden">Location</div>
                  <AddressDisplay
                    lat={order.latitude}
                    lon={order.longitude}
                    address={order.address}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-[11px] uppercase text-slate-400 sm:hidden">Weight</div>
                  {order.weightKg} kg
                </td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="text-[11px] uppercase text-slate-400 sm:hidden">Vehicle</div>
                  {assignedVehicleByOrderId?.get(order.id) ? (
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(assignedVehicleByOrderId.get(order.id) || null)}
                      className="text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                    >
                      {assignedVehicleByOrderId.get(order.id)!.name}
                    </button>
                  ) : (
                    "Unassigned"
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-[11px] uppercase text-slate-400 sm:hidden">Status</div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${order.status === "ASSIGNED" 
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-[11px] uppercase text-slate-400 sm:hidden">Actions</div>
                  <button
                    onClick={() => onDelete(order.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
            </tbody>
          </table>
        </div>

      {selectedVehicle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Vehicle Details</h2>
              <p className="text-sm text-slate-500">Assigned vehicle information.</p>
            </div>
            <div className="space-y-3 px-4 py-5 text-sm text-slate-700 sm:px-6">
              <div>
                <span className="text-slate-500">License Plate:</span> {selectedVehicle.name}
              </div>
              <div>
                <span className="text-slate-500">Capacity:</span> {selectedVehicle.capacityKg} kg
              </div>
              <div>
                <span className="text-slate-500">Start Address:</span>{" "}
                {selectedVehicle.address
                  ? selectedVehicle.address
                  : `${selectedVehicle.startLat.toFixed(4)}, ${selectedVehicle.startLon.toFixed(4)}`}
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                {selectedVehicle.status || "AVAILABLE"}
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedVehicle(null)}
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