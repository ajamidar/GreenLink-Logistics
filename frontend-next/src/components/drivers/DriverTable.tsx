"use client";

import { Driver, Vehicle } from "@/lib/types";
import { Trash2, Phone, Truck } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

interface DriverTableProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, payload: { status?: Driver["status"]; assignedVehicleId?: string | null }) => Promise<Driver>;
}

const statusStyles: Record<Driver["status"], string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ON_ROUTE: "bg-blue-100 text-blue-700 border-blue-200",
  OFF_DUTY: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function DriverTable({ drivers, vehicles, onDelete, onUpdate }: DriverTableProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { status?: Driver["status"]; assignedVehicleId?: string | null }>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [saveErrorIds, setSaveErrorIds] = useState<Record<string, boolean>>({});

  const getDraft = (driver: Driver) => {
    const draft = drafts[driver.id] || {};
    return {
      status: draft.status ?? driver.status,
      assignedVehicleId:
        draft.assignedVehicleId !== undefined
          ? draft.assignedVehicleId
          : driver.assignedVehicle?.id || "",
    };
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-6 py-3">Driver</th>
              <th className="px-6 py-3">Home Base</th>
              <th className="px-6 py-3">Assigned Vehicle</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No drivers found. Add one to get started.
                </td>
              </tr>
            ) : (
              drivers.map((driver) => {
                const draft = getDraft(driver);
                const hasChanges =
                  draft.status !== driver.status ||
                  (draft.assignedVehicleId || "") !== (driver.assignedVehicle?.id || "");

                return (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Driver</div>
                    <button
                      type="button"
                      onClick={() => setSelectedDriver(driver)}
                      className="text-left"
                    >
                      <div className="font-medium text-slate-900">{driver.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} /> {driver.phone}
                        </span>
                        {driver.email ? (
                          <>
                            <span className="text-slate-300">|</span>
                            <span>{driver.email}</span>
                          </>
                        ) : null}
                        <span className="text-slate-300">|</span>
                        <span>License {driver.licenseId}</span>
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Home Base</div>
                    <span className="inline-block max-w-[240px] truncate">{driver.homeBase}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Assigned Vehicle</div>
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-slate-400" />
                      <select
                        value={draft.assignedVehicleId || ""}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [driver.id]: {
                              ...prev[driver.id],
                              assignedVehicleId: event.target.value || null,
                            },
                          }))
                        }
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                      >
                        <option value="">Unassigned</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Status</div>
                    <select
                      value={draft.status}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [driver.id]: {
                            ...prev[driver.id],
                            status: event.target.value as Driver["status"],
                          },
                        }))
                      }
                      className={clsx(
                        "rounded-full border px-2.5 py-1 text-xs font-medium",
                        statusStyles[draft.status]
                      )}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ON_ROUTE">ON ROUTE</option>
                      <option value="OFF_DUTY">OFF DUTY</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-[11px] uppercase text-slate-400 sm:hidden">Actions</div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSavingIds((prev) => ({ ...prev, [driver.id]: true }));
                          setSaveErrorIds((prev) => ({ ...prev, [driver.id]: false }));
                          const payload = {
                            status: draft.status,
                            assignedVehicleId: draft.assignedVehicleId || null,
                          };
                          onUpdate(driver.id, payload)
                            .then(() => {
                              setDrafts((prev) => {
                                const next = { ...prev };
                                delete next[driver.id];
                                return next;
                              });
                            })
                            .catch(() => {
                              setSaveErrorIds((prev) => ({ ...prev, [driver.id]: true }));
                            })
                            .finally(() => {
                              setSavingIds((prev) => ({ ...prev, [driver.id]: false }));
                            });
                        }}
                        disabled={!hasChanges || savingIds[driver.id]}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                      >
                        {savingIds[driver.id] ? "Saving..." : "Save"}
                      </button>
                      {saveErrorIds[driver.id] ? (
                        <span className="text-xs text-red-500">Failed</span>
                      ) : null}
                    <button
                      onClick={() => onDelete(driver.id)}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-colors"
                      title="Delete Driver"
                    >
                      <Trash2 size={18} />
                    </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedDriver ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Driver Snapshot</h2>
              <p className="text-sm text-slate-500">Contact and availability details.</p>
            </div>
            <div className="space-y-3 px-4 py-5 text-sm text-slate-700 sm:px-6">
              <div>
                <span className="text-slate-500">Name:</span> {selectedDriver.name}
              </div>
              <div>
                <span className="text-slate-500">Phone:</span> {selectedDriver.phone}
              </div>
              <div>
                <span className="text-slate-500">License:</span> {selectedDriver.licenseId}
              </div>
              <div>
                <span className="text-slate-500">Home Base:</span> {selectedDriver.homeBase}
              </div>
              <div>
                <span className="text-slate-500">Assigned Vehicle:</span>{" "}
                {selectedDriver.assignedVehicle?.name || "Unassigned"}
              </div>
              <div>
                <span className="text-slate-500">Last Check-in:</span>{" "}
                {selectedDriver.lastCheckIn || "No recent update"}
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
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
