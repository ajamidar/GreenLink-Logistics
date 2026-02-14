"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, Truck, MapPin, LogOut, Menu, X } from "lucide-react";
import clsx from "clsx";
import Image from "next/image"; // Import the Image component

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: Package },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Drivers", href: "/drivers", icon: MapPin },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

        {/* Footer Area */}
        <div className="border-t border-slate-100 p-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}