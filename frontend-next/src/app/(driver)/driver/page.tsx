"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAccountProfile, fetchDriverRoute, markOrderDelivered } from "@/lib/api";
import { Route, Order } from "@/lib/types";
import dynamic from "next/dynamic";
import { CheckCircle2, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

const Map = dynamic(() => import("@/components/dashboard/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-slate-900/60 animate-pulse" />
  ),
});

export default function DriverPortalPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [vehicleName, setVehicleName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedStopId, setFocusedStopId] = useState<string | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);

  const mapOrders = useMemo(
    () => orders.filter((order) => Number.isFinite(order.latitude) && Number.isFinite(order.longitude)),
    [orders]
  );

  const orderedStops = useMemo(() => {
    const pending = orders.filter((order) => order.status !== "DELIVERED");
    const delivered = orders.filter((order) => order.status === "DELIVERED");
    return [...pending, ...delivered];
  }, [orders]);

  const nextStop = useMemo(
    () => orderedStops.find((order) => order.status !== "DELIVERED"),
    [orderedStops]
  );

  const focusedStop = useMemo(() => {
    if (!focusedStopId) return nextStop ?? null;
    return orderedStops.find((order) => order.id === focusedStopId) ?? nextStop ?? null;
  }, [focusedStopId, nextStop, orderedStops]);

  const remainingStops = useMemo(
    () => orderedStops.filter((order) => order.status !== "DELIVERED"),
    [orderedStops]
  );

  useEffect(() => {
    loadRoute();
  }, []);

  const loadRoute = async () => {
    try {
      setLoading(true);
      const [routeData, accountData] = await Promise.all([
        fetchDriverRoute(),
        fetchAccountProfile(),
      ]);
      setDriverName(accountData.fullName || routeData.driverName);
      setVehicleName(routeData.vehicleName);
      setEtaMinutes(
        typeof routeData.estimatedRemainingMinutes === "number"
          ? routeData.estimatedRemainingMinutes
          : null
      );

      const mappedOrders: Order[] = routeData.stops.map((stop) => ({
        id: stop.id,
        organizationId: "",
        weightKg: 0,
        serviceDurationMin: stop.serviceDurationMin ?? 0,
        latitude: stop.latitude ?? 0,
        longitude: stop.longitude ?? 0,
        address: stop.address ?? "",
        status: stop.status as Order["status"],
      }));

      setOrders(mappedOrders);
      setRoute({
        id: "driver-route",
        organizationId: "",
        status: routeData.routeStatus ?? "PLANNED",
        orders: mappedOrders,
      });
      setError(null);
      setFocusedStopId((prev) => prev ?? (mappedOrders.find((order) => order.status !== "DELIVERED")?.id ?? null));
    } catch (err) {
      setError("Unable to load your route. Please contact dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("gl_token");
    document.cookie = "gl_token=; Path=/; Max-Age=0; SameSite=Lax";
    router.push("/login");
  };

  const handleDelivered = async (orderId: string) => {
    try {
      await markOrderDelivered(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "DELIVERED" } : order
        )
      );
    } catch (err) {
      setError("Could not update delivery status.");
    }
  };

  const openDirections = (order: Order) => {
    const destination = order.address 
      ? encodeURIComponent(order.address)
      : `${order.latitude},${order.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (!focusedStopId) {
      setFocusedStopId(nextStop?.id ?? null);
      return;
    }
    const current = orders.find((order) => order.id === focusedStopId);
    if (current && current.status === "DELIVERED") {
      setFocusedStopId(nextStop?.id ?? null);
    }
  }, [orders, focusedStopId, nextStop]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Driver Portal</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{driverName || "Your route"}</h1>
          <p className="text-sm text-slate-300">Vehicle: {vehicleName || "Unassigned"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/driver/account"
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90"
          >
            Account
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90"
          >
            Sign out
          </button>
          <button
            onClick={loadRoute}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/90"
          >
            Refresh
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <div className="h-56 w-full rounded-2xl bg-slate-900/60 animate-pulse" />
          <div className="h-24 w-full rounded-2xl bg-slate-900/60 animate-pulse" />
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-emerald-200">
              <MapPin size={16} />
              Current stop
            </div>
            {focusedStop ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {focusedStop.address || "Address pending"}
                  </h2>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                    {remainingStops.length} left
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Est remaining time: {etaMinutes ?? "--"} min
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openDirections(focusedStop)}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                  >
                    <Navigation size={16} /> Directions
                  </button>
                  {focusedStop.status !== "DELIVERED" ? (
                    <button
                      onClick={() => handleDelivered(focusedStop.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900"
                    >
                      <CheckCircle2 size={16} /> Mark delivered
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-200">Delivered</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-300">All stops delivered. Nice work!</p>
            )}
          </section>

          <section className="h-64 rounded-3xl border border-white/10 bg-white/5 p-2">
            <Map
              orders={mapOrders}
              routes={route ? [route] : []}
              vehicles={[]}
              focus={
                focusedStop && Number.isFinite(focusedStop.latitude) && Number.isFinite(focusedStop.longitude)
                  ? [focusedStop.latitude, focusedStop.longitude]
                  : undefined
              }
              focusZoom={14}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-[0.3em] text-emerald-200">Upcoming stops</h2>
            {orderedStops.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                No assigned stops yet.
              </div>
            ) : (
              orderedStops.map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{order.address || "Address pending"}</p>
                      <p className="text-xs text-slate-300">Status: {order.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDirections(order)}
                        className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        Directions
                      </button>
                      {order.status !== "DELIVERED" ? (
                        <button
                          onClick={() => setFocusedStopId(order.id)}
                          className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80"
                        >
                          Set current
                        </button>
                      ) : null}
                      {order.status !== "DELIVERED" ? (
                        <button
                          onClick={() => handleDelivered(order.id)}
                          className="rounded-full border border-emerald-300/60 px-3 py-1 text-xs font-semibold text-emerald-100"
                        >
                          Delivered
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-200">Done</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
