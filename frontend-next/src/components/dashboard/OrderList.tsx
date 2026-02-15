"use client";

import { Order } from "@/lib/types";
import { Package, MapPin, Clock } from "lucide-react";
import clsx from "clsx";

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full md:h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Package className="text-emerald-600" size={20} />
          Unassigned Orders
        </h2>
        <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
          {orders.length}
        </span>
      </div>

      {/* Scrollable List */}
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {orders.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>No orders found.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="p-3 rounded-lg border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-slate-700 text-sm">
                  Order #{order.id.slice(0, 8)}...
                </span>
                <Badge status={order.status} />
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span className="truncate max-w-[220px]">
                    {order.address && order.address.trim()
                      ? order.address
                      : `${order.latitude.toFixed(4)}, ${order.longitude.toFixed(4)}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Package size={12} /> {order.weightKg}kg
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {order.serviceDurationMin}m
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper Component for Status Badges
function Badge({ status }: { status: string }) {
  const styles = {
    UNASSIGNED: "bg-amber-100 text-amber-700 border-amber-200",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const currentStyle = styles[status as keyof typeof styles] || "bg-slate-100 text-slate-600";

  return (
    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border", currentStyle)}>
      {status}
    </span>
  );
}