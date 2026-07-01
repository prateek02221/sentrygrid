import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatRole(role?: string) {
  if (!role) return "Operator";
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { logout, user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const roleLabel = formatRole(user?.role);
  const firstName = user?.name?.split(" ")[0] ?? roleLabel;
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? roleLabel.slice(0, 2).toUpperCase();

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
            {getGreeting(time.getHours())}, {firstName}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time threat detection &amp; incident management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-xs font-mono-data tabular-nums hidden sm:block">
          {time.toLocaleTimeString()}
        </span>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-teal-50 border border-teal-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span className="text-teal-700 text-xs font-semibold">
            System Healthy
          </span>
        </div>

        <div
          title={roleLabel}
          className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-teal-700 font-mono-data"
        >
          {initials}
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}