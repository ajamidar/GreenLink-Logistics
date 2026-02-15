"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Order, Route, Vehicle } from "@/lib/types";
import { fetchOrders, deleteOrder, createOrder, fetchRoutes } from "@/lib/api";
import OrderTable from "@/components/orders/OrderTable";
import { Plus } from "lucide-react";


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    street: "",
    city: "",
    state: "",
    postal: "",
    weightKg: "",
    serviceDurationMin: "",
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [orderData, routeData] = await Promise.all([
        fetchOrders(),
        fetchRoutes(),
      ]);
      setOrders(orderData);
      setRoutes(routeData);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const assignedVehicleByOrderId = useMemo(() => {
    const map = new Map<string, Vehicle>();
    for (const route of routes) {
      const vehicle = route.vehicle;
      if (!vehicle) continue;
      const stops = route.orders || route.stops || [];
      for (const stop of stops) {
        if (!stop) continue;
        if (typeof stop === "string") {
          map.set(stop, vehicle);
          continue;
        }
        if (typeof stop === "object") {
          const id = "id" in stop ? stop.id : undefined;
          const orderId = "orderId" in stop ? stop.orderId : undefined;
          const resolvedId = orderId || id;
          if (resolvedId) {
            map.set(String(resolvedId), vehicle);
          }
        }
      }
    }
    return map;
  }, [routes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id);
      setOrders(orders.filter((o) => o.id !== id)); // Optimistic update
    } catch (error) {
      alert("Failed to delete order.");
    }
  };

  const handleOpenCreate = () => {
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (isSubmitting) return;
    setIsCreateOpen(false);
    setFormError(null);
  };

  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const parsedValues = useMemo(() => {
    const weightKg = Number(formState.weightKg);
    const serviceDurationMin = Number(formState.serviceDurationMin);
    const street = formState.street.trim();
    const city = formState.city.trim();
    const state = formState.state.trim();
    const postal = formState.postal.trim();
    const baseAddress = [street, city, state].filter(Boolean).join(", ");
    const address = postal ? `${baseAddress} ${postal}` : baseAddress;

    return { weightKg, serviceDurationMin, street, city, state, address };
  }, [formState]);

  const isFormValid = useMemo(() => {
    const { weightKg, serviceDurationMin, street, city, state } = parsedValues;
    return (
      street.length > 0 &&
      city.length > 0 &&
      state.length > 0 &&
      Number.isFinite(weightKg) &&
      Number.isFinite(serviceDurationMin)
    );
  }, [parsedValues]);

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!isFormValid) {
      setFormError("Please complete the address and numeric fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createOrder({
        weightKg: parsedValues.weightKg,
        serviceDurationMin: parsedValues.serviceDurationMin,
        address: parsedValues.address,
      });
      setOrders((prev) => [created, ...prev]);
      setFormState({
        street: "",
        city: "",
        state: "",
        postal: "",
        weightKg: "",
        serviceDurationMin: "",
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Failed to create order", error);
      const maybeMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setFormError(maybeMessage || "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-slate-500">View and manage all delivery requests.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 sm:w-auto"
        >
          <Plus size={20} />
          New Order
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading orders...</div>
      ) : (
        <OrderTable
          orders={orders}
          onDelete={handleDelete}
          assignedVehicleByOrderId={assignedVehicleByOrderId}
        />
      )}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Create New Order</h2>
              <p className="text-sm text-slate-500">Provide delivery address and details.</p>
            </div>
            <form className="space-y-4 px-4 py-5 sm:px-6" onSubmit={handleCreateOrder}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-600">
                  Street address
                  <input
                    type="text"
                    value={formState.street}
                    onChange={(event) => handleFormChange("street", event.target.value)}
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
                    onChange={(event) => handleFormChange("city", event.target.value)}
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
                    onChange={(event) => handleFormChange("state", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                    placeholder="NY"
                    required
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Postal code
                  <input
                    type="text"
                    value={formState.postal}
                    onChange={(event) => handleFormChange("postal", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                    placeholder="10001"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-600">
                  Weight (kg)
                  <input
                    type="number"
                    step="1"
                    value={formState.weightKg}
                    onChange={(event) => handleFormChange("weightKg", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                    placeholder="120"
                    required
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Service time (min)
                  <input
                    type="number"
                    step="1"
                    value={formState.serviceDurationMin}
                    onChange={(event) => handleFormChange("serviceDurationMin", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
                    placeholder="15"
                    required
                  />
                </label>
              </div>

              {formError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCreate}
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
                  {isSubmitting ? "Saving..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}