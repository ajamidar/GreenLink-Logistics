"use client";

import { useMemo, useState, type FormEvent } from "react";

interface NewVehicleModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: {
    licensePlate: string;
    capacityKg: number;
    address: string;
  }) => void;
}

export default function NewVehicleModal({
  isOpen,
  isSubmitting,
  onClose,
  onCreate,
}: NewVehicleModalProps) {
  const [formState, setFormState] = useState({
    licensePlate: "",
    capacityKg: "",
    street: "",
    city: "",
    state: "",
    postal: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const parsedValues = useMemo(() => {
    return {
      licensePlate: formState.licensePlate.trim(),
      capacityKg: Number(formState.capacityKg),
      street: formState.street.trim(),
      city: formState.city.trim(),
      state: formState.state.trim(),
      postal: formState.postal.trim(),
      address: [
        formState.street.trim(),
        formState.city.trim(),
        formState.state.trim(),
      ]
        .filter(Boolean)
        .join(", ")
        .concat(formState.postal.trim() ? ` ${formState.postal.trim()}` : ""),
    };
  }, [formState]);

  const isValid = useMemo(() => {
    return (
      parsedValues.licensePlate.length > 0 &&
      Number.isFinite(parsedValues.capacityKg) &&
      parsedValues.capacityKg > 0 &&
      parsedValues.street.length > 0 &&
      parsedValues.city.length > 0 &&
      parsedValues.state.length > 0
    );
  }, [parsedValues]);

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setGeoLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
          const res = await fetch(url, {
            headers: { "User-Agent": "GreenLinkLogistics/1.0" },
          });

          if (!res.ok) throw new Error("Failed to fetch address");
          const data = await res.json();
          const address = data?.address || {};
          const houseNumber = address.house_number ? `${address.house_number} ` : "";
          const road = address.road || address.pedestrian || "";
          const city = address.city || address.town || address.village || address.county || "";
          const state = address.state || "";
          const postal = address.postcode || "";

          if (road || city || state) {
            setFormState((prev) => ({
              ...prev,
              street: `${houseNumber}${road}`.trim(),
              city,
              state,
              postal,
            }));
          } else if (typeof data?.display_name === "string" && data.display_name.trim()) {
            setFormState((prev) => ({
              ...prev,
              street: data.display_name,
              city: "",
              state: "",
              postal: "",
            }));
          } else {
            setError("Unable to resolve your address. Please type it manually.");
          }
        } catch (err) {
          setError("Unable to resolve your address. Please type it manually.");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setError("Unable to fetch your current location.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Please complete all fields with valid values.");
      return;
    }

    onCreate({
      licensePlate: parsedValues.licensePlate,
      capacityKg: parsedValues.capacityKg,
      address: parsedValues.address,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Add Vehicle</h2>
          <p className="text-sm text-slate-500">Register a new truck for dispatch.</p>
        </div>
        <form className="space-y-4 px-6 py-5" onSubmit={handleSubmit}>
          <label className="space-y-1 text-sm text-slate-600">
            License Plate
            <input
              type="text"
              value={formState.licensePlate}
              onChange={(event) => handleChange("licensePlate", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
              placeholder="GL-1029"
              required
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              Capacity (kg)
              <input
                type="number"
                min="1"
                step="1"
                value={formState.capacityKg}
                onChange={(event) => handleChange("capacityKg", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                placeholder="2000"
                required
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleUseLocation}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                disabled={geoLoading}
              >
                {geoLoading ? "Locating..." : "Use Current Location"}
              </button>
            </div>
          </div>
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
            Full address: {parsedValues.address || "Provide address details above"}
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
              {isSubmitting ? "Saving..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
