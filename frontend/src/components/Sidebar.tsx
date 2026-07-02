import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 flex-shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  dashboard: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
  incidents: "M12 3 21 19H3L12 3Zm0 6v4m0 3h.01",
  analytics: "M4 19V9m6 10V5m6 14v-7m6 7V3",
  threatIntel:
    "M12 2 20 6v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z",
  iocs:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
  users:
    "M16 14a4 4 0 1 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 21v-1a4 4 0 0 1 4-4M20 21v-1a4 4 0 0 0-4-4",
};

function formatRole(role?: string) {
  if (!role) return "";
  return role.replace(/_/g, " ").toUpperCase();
}

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
      isActive(path)
        ? "bg-teal-500/15 text-teal-300 border-teal-500/30"
        : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border-transparent"
    } ${collapsed ? "justify-center" : ""}`;

  const navItems: {
    to: string;
    icon: string;
    label: string;
    visible: boolean;
  }[] = [
    { to: "/", icon: ICONS.dashboard, label: "Dashboard", visible: true },
    {
      to: "/incidents",
      icon: ICONS.incidents,
      label: "Incidents",
      visible: user?.role === "admin" || user?.role === "security_analyst",
    },
    { to: "/analytics", icon: ICONS.analytics, label: "Analytics", visible: true },
    {
      to: "/threat-intelligence",
      icon: ICONS.threatIntel,
      label: "Threat Intelligence",
      visible: user?.role === "admin" || user?.role === "security_analyst",
    },
    { to: "/iocs", icon: ICONS.iocs, label: "IOC Management", visible: user?.role === "admin" },
    { to: "/users", icon: ICONS.users, label: "User Management", visible: user?.role === "admin" },
  ];

  return (
    <div
      className={`bg-slate-900 h-screen p-5 flex flex-col transition-all duration-200 flex-shrink-0 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className={`flex items-center gap-2.5 mb-1 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-teal-300 text-sm font-bold font-display">
            S
          </span>
        </div>
        {!collapsed && (
          <h1 className="text-white text-lg font-bold font-display tracking-tight whitespace-nowrap">
            SentryGrid
          </h1>
        )}
      </div>

      {!collapsed && (
        <p className="text-slate-500 text-[11px] font-mono-data tracking-wider mb-8 pl-[42px]">
          {formatRole(user?.role)}
        </p>
      )}
      {collapsed && <div className="mb-8" />}

      <nav className="space-y-1 flex-1">
        {navItems
          .filter((item) => item.visible)
          .map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkClass(item.to)}
              title={collapsed ? item.label : undefined}
            >
              <Icon d={item.icon} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
      </nav>

      <div className="pt-4 border-t border-white/10">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "monitoring active" : undefined}
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
          </span>
          {!collapsed && (
            <span className="text-[11px] text-slate-400 font-mono-data whitespace-nowrap">
              monitoring active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}