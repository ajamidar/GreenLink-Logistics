"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Vehicle } from "@/lib/types";

interface NewDriverModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    email: string;
    phone: string;
    licenseId: string;
    homeBase: string;
    status: "AVAILABLE" | "ON_ROUTE" | "OFF_DUTY";
    assignedVehicleId?: string;
  }) => void;
  vehicles: Vehicle[];
}

export default function NewDriverModal({
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
  vehicles,
}: NewDriverModalProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    licenseId: "",
    street: "",
    city: "",
    state: "",
    postal: "",
    status: "AVAILABLE" as "AVAILABLE" | "ON_ROUTE" | "OFF_DUTY",
    assignedVehicleId: "",
  });
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const address = [
      formState.street.trim(),
      formState.city.trim(),
      formState.state.trim(),
    ]
      .filter(Boolean)
      .join(", ")
      .concat(formState.postal.trim() ? ` ${formState.postal.trim()}` : "");

    return {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      licenseId: formState.licenseId.trim(),
      homeBase: address,
      status: formState.status,
      assignedVehicleId: formState.assignedVehicleId || undefined,
      street: formState.street.trim(),
      city: formState.city.trim(),
      state: formState.state.trim(),
    };
  }, [formState]);

  const isValid = useMemo(() => {
    return (
      parsed.name.length > 0 &&
      parsed.email.length > 0 &&
      parsed.licenseId.length > 0 &&
      parsed.street.length > 0 &&
      parsed.city.length > 0 &&
      parsed.state.length > 0
    );
  }, [parsed]);

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Please complete required driver details.");
      return;
    }

    onCreate({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || "Not provided",
      licenseId: parsed.licenseId,
      homeBase: parsed.homeBase,
      status: parsed.status,
      assignedVehicleId: parsed.assignedVehicleId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Add Driver</h2>
          <p className="text-sm text-slate-500">Register a new driver for dispatch.</p>
        </div>
        <form className="space-y-4 px-4 py-5 sm:px-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              Driver Name
              <input
                type="text"
                value={formState.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="Jamie Park"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Driver Email
              <input
                type="email"
                value={formState.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="driver@greenlink.com"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              License ID
              <input
                type="text"
                value={formState.licenseId}
                onChange={(event) => handleChange("licenseId", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="DL-49201"
                required
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              Phone (optional)
              <input
                type="tel"
                value={formState.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="+1 (212) 555-0192"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Status
              <select
                value={formState.status}
                onChange={(event) => handleChange("status", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_ROUTE">On Route</option>
                <option value="OFF_DUTY">Off Duty</option>
              </select>
            </label>
          </div>
          <label className="space-y-1 text-sm text-slate-600">
            Assigned Vehicle (optional)
            <select
              value={formState.assignedVehicleId}
              onChange={(event) => handleChange("assignedVehicleId", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
            >
              <option value="">Unassigned</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              Street Address
              <input
                type="text"
                value={formState.street}
                onChange={(event) => handleChange("street", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="123 Main St"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              City
              <input
                type="text"
                value={formState.city}
                onChange={(event) => handleChange("city", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="New York"
                required
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              State / Region
              <input
                type="text"
                value={formState.state}
                onChange={(event) => handleChange("state", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="NY"
                required
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Postal Code
              <input
                type="text"
                value={formState.postal}
                onChange={(event) => handleChange("postal", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="10001"
              />
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Home base: {parsed.homeBase || "Provide address details above"}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
