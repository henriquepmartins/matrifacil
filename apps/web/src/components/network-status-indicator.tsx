"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { isOnline } from "@/lib/utils/network";

export function NetworkStatusIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Modo Offline</span>
    </div>
  );
}
