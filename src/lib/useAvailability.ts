"use client";

import { useState, useEffect } from "react";

export interface AvailabilityState {
  timeString: string;
  utcOffset: string;
  isWorkingHours: boolean;
  statusText: string;
  badgeLabel: string;
  responseTime: string;
  scheduleNote: string;
  location: string;
}

export function useAvailability(): AvailabilityState {
  const [state, setState] = useState<AvailabilityState>({
    timeString: "",
    utcOffset: "UTC+5:30",
    isWorkingHours: true,
    statusText: "ONLINE / AVAILABLE",
    badgeLabel: "Available for roles",
    responseTime: "< 2 Hours",
    scheduleNote: "Pune, MH, India · Remote Worldwide",
    location: "Pune, MH, India · Remote Worldwide",
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const istTimeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      // Calculate IST decimal hour
      const istFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const parts = istFormatter.formatToParts(now);
      const h = parseInt(parts.find((p) => p.type === "hour")?.value || "12", 10);
      const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
      const decimalHour = h + m / 60;

      // Working window: 09:30 to 22:30 IST (09:30 AM – 10:30 PM)
      const isWorking = decimalHour >= 9.5 && decimalHour < 22.5;

      if (isWorking) {
        setState({
          timeString: `${istTimeStr} IST`,
          utcOffset: "UTC+5:30",
          isWorkingHours: true,
          statusText: "ONLINE / ACTIVE AT DESK",
          badgeLabel: "Active at desk (IST)",
          responseTime: "< 2 Hours (Active)",
          scheduleNote: "Working in Pune (IST) · Quick responses",
          location: "Pune, MH, India · Remote Worldwide",
        });
      } else {
        setState({
          timeString: `${istTimeStr} IST`,
          utcOffset: "UTC+5:30",
          isWorkingHours: false,
          statusText: "OFFLINE / RESTING (IST)",
          badgeLabel: "Resting · Replies 9:30 AM IST",
          responseTime: "Replies ~9:30 AM IST (< 6 hrs)",
          scheduleNote: "Night in Pune (UTC+5:30) · Will reply early morning",
          location: "Pune, MH, India · Remote Worldwide",
        });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
