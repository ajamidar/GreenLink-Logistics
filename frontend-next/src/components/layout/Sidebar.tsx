"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, Package, Truck, MapPin, LogOut, Menu, X, Sparkles, User } from "lucide-react";
import clsx from "clsx";
import Image from "next/image"; // Import the Image component
import { fetchRoutes, fetchVehicles } from "@/lib/api";
import { Route, Vehicle } from "@/lib/types";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: Package },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: MapPin },
  { name: "Account", href: "/account", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  const liveRefreshMs = 15000;

  const handleSignOut = () => {
    localStorage.removeItem("gl_token");
    document.cookie = "gl_token=; Path=/; Max-Age=0; SameSite=Lax";
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const loadDispatchData = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setLoadingVehicles(true);
        setLoadingRoutes(true);
      }
      const [vehicleData, routeData] = await Promise.all([
        fetchVehicles(),
        fetchRoutes(),
      ]);
      setVehicles(vehicleData);
      setRoutes(routeData);
    } catch (error) {
      console.warn("Unable to load vehicles", error);
    } finally {
      if (!silent) {
        setLoadingVehicles(false);
        setLoadingRoutes(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDispatchData();
  }, [loadDispatchData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadDispatchData({ silent: true });
    }, liveRefreshMs);

    return () => window.clearInterval(intervalId);
  }, [loadDispatchData, liveRefreshMs]);

  const routeStatsByVehicleId = routes.reduce((acc, route) => {
    const vehicleId = route.vehicleId || route.vehicle?.id;
    const orders = route.orders ?? [];
    if (!vehicleId || orders.length === 0) {
      return acc;
    }

    const delivered = orders.filter((order) => {
      return typeof order === "object" && order !== null && "status" in order && order.status === "DELIVERED";
    }).length;
    acc.set(vehicleId, { total: orders.length, delivered });
    return acc;
  }, new globalThis.Map<string, { total: number; delivered: number }>());

  return (
    <>
      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-white border-b border-slate-200 px-4 md:hidden">
        <div className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-700">
          {/* Mobile Logo */}
          <div className="relative h-10 w-10 items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="Green Link Logo" 
              fill 
              className="object-contain pb-0.5" 
            />
          </div>
          <span className="text-lg">Green Link</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- OVERLAY (Backdrop for mobile) --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR (Fixed on Desktop, Slide-over on Mobile) --- */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:top-0"
        )}
      >
        {/* Logo Area (Desktop only) */}
        <div className="hidden h-16 items-center  px-6 md:flex border-b border-slate-200">
          <Link href="/" className="flex items-center justify-center gap-2 font-bold text-slate-800 hover:text-slate-700 text-xl">
            {/* Desktop Logo - Adjusted Size */}
            <div className="relative h-10 w-10 items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="Green Link Logo" 
                fill 
                className="object-contain pb-0.5" 
                priority // Loads image faster since it's above the fold
              />
            </div>
            <span>Green Link</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4 mt-16 md:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Live Dispatch Board */}
        <div className="px-4 pb-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Live dispatch</p>
                <p className="text-sm font-semibold text-slate-800">Vehicle status</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Realtime
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {loadingVehicles || loadingRoutes ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                  No vehicles connected yet.
                </div>
              ) : (
                vehicles.slice(0, 4).map((vehicle) => (
                  <div key={vehicle.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    {(() => {
                      const stats = routeStatsByVehicleId.get(vehicle.id);
                      const totalOrders = stats?.total ?? 0;
                      const deliveredOrders = stats?.delivered ?? 0;
                      const remainingOrders = Math.max(totalOrders - deliveredOrders, 0);
                      const progress = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
                      return (
                        <>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">{vehicle.name}</span>
                            <span
                              className={clsx(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                vehicle.status === "IN_TRANSIT"
                                  ? "bg-amber-100 text-amber-700"
                                  : vehicle.status === "MAINTENANCE"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-emerald-100 text-emerald-700"
                              )}
                            >
                              {vehicle.status || "AVAILABLE"}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {totalOrders > 0
                                ? `${remainingOrders} left of ${totalOrders}`
                                : "No active route"}
                            </span>
                            <span>{progress}%</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                            <div
                              className={clsx(
                                "h-1.5 rounded-full",
                                vehicle.status === "IN_TRANSIT"
                                  ? "bg-amber-400"
                                  : vehicle.status === "MAINTENANCE"
                                  ? "bg-red-400"
                                  : "bg-emerald-400"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live operations
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Healthy
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">All systems operational</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={14} className="text-emerald-500" />
              Auto-sync enabled
            </div>
          </div>

          <button
            className="mt-3 flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            onClick={handleSignOut}
          >
            <span className="inline-flex items-center gap-3">
              <LogOut size={18} className="text-red-500" />
              Sign Out
            </span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">v2.4</span>
          </button>
        </div>
      </aside>
    </>
  );
}