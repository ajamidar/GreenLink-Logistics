"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

interface AddressDisplayProps {
  lat: number;
  lon: number;
  address?: string;
}

export default function AddressDisplay({ lat, lon, address }: AddressDisplayProps) {
  const [displayAddress, setDisplayAddress] = useState<string>("Locating...");

  useEffect(() => {
    let isMounted = true;

    if (address && address.trim()) {
      setDisplayAddress(address);
      return () => {
        isMounted = false;
      };
    }

    const fetchAddress = async () => {
      try {
        // We use OpenStreetMap's free Nominatim API
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

        const res = await fetch(url, {
          headers: {
            // Good practice to identify your app to OSM
            "User-Agent": "GreenLinkLogistics/1.0",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (isMounted && data.display_name) {
          // Format: "123 Main St, New York, NY..." -> We take just the first 2 parts for brevity
          const parts = data.display_name.split(",");
          const shortAddress = parts.slice(0, 2).join(",");
          setDisplayAddress(shortAddress);
        }
      } catch (error) {
        if (isMounted) setDisplayAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    };

    // Add a small random delay to prevent hitting the API rate limit if you have many orders
    const timer = setTimeout(() => {
      fetchAddress();
    }, Math.random() * 1000);

    return () => {
        isMounted = false;
        clearTimeout(timer);
    };
  }, [address, lat, lon]);

  return (
    <div className="flex items-center gap-2" title={`Lat: ${lat}, Lon: ${lon}`}>
      <MapPin size={16} className="text-emerald-500 shrink-0" />
      <span className="truncate max-w-[250px]">{displayAddress}</span>
    </div>
  );
}