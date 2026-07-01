import { useEffect, useState } from "react";
import { api, getWebSocketUrl } from "../services/api";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";

interface DashboardStats {
  system_status: string;
  total_threats: number;
  critical_threats: number;
  open_incidents: number;
  investigating_incidents: number;
  resolved_incidents: number;
}

interface Threat {
  _id: string;
  event_type: string;
  severity: string;
  country: string;
  risk_score: number;
  created_at: string;
}

const STAT_ICONS = {
  threats: "M12 2 20 6v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z",
  critical: "M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  open: "M3 7h6l2 2h10v10H3V7Z",
  resolved: "M9 12 11 14l4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const summaryResponse = await api.get("/dashboard/health-summary");
      setStats(summaryResponse.data);

      const threatResponse = await api.get("/dashboard/recent-threats");
      setThreats(threatResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const alert = {
        id: Date.now(),
        message,
      };

      setAlerts((prev) => [alert, ...prev].slice(0, 10));

      console.log("WebSocket Message:", message);

      if (message.type === "new_threat") {
        toast.success(`Threat Detected: ${message.data.event_type}`);
        loadDashboard();
      }

      if (message.type === "new_incident") {
        toast.error(`New Incident Created`);
        loadDashboard();
      }

      if (message.type === "incident_status_updated") {
        toast(`Incident Updated: ${message.data.status}`);
        loadDashboard();
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    const map: Record<string, { dot: string; text: string; bg: string; label: string }> = {
      critical: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", label: "Critical" },
      high: { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", label: "High" },
      medium: { dot: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50", label: "Medium" },
    };
    const s = map[severity] ?? { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50", label: "Low" };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 font-display mb-6">
        Dashboard
      </h1>

      {/* Command strip */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white ops-grid p-6 mb-6 card-shadow">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-teal-600 text-xs font-mono-data tracking-[0.2em] mb-1.5">
              LIVE OPERATIONS FEED
            </p>
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Mini SOC Command Center
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Real-time threat detection &amp; incident management
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-data text-slate-500 tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            synced {currentTime || "--:--:--"}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Threats" value={stats?.total_threats ?? 0} icon={STAT_ICONS.threats} accent="teal" />
        <StatCard label="Critical Threats" value={stats?.critical_threats ?? 0} icon={STAT_ICONS.critical} accent="red" />
        <StatCard label="Open Incidents" value={stats?.open_incidents ?? 0} icon={STAT_ICONS.open} accent="yellow" />
        <StatCard label="Resolved Incidents" value={stats?.resolved_incidents ?? 0} icon={STAT_ICONS.resolved} accent="green" />
      </div>

      {/* Main content: table + side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent threat activity */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
            Recent Threat Activity
          </h2>

          <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">
                      THREAT TYPE
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">
                      SEVERITY
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">
                      COUNTRY
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">
                      RISK SCORE
                    </th>
                    <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">
                      CREATED
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {threats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-slate-400 text-sm">
                        No threats found
                      </td>
                    </tr>
                  ) : (
                    threats.map((threat) => (
                      <tr
                        key={threat._id}
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 text-sm text-slate-700">{threat.event_type}</td>
                        <td className="p-4">{getSeverityBadge(threat.severity)}</td>
                        <td className="p-4 text-sm text-slate-500">{threat.country}</td>
                        <td className="p-4 font-mono-data font-bold text-sm tabular-nums">
                          <span
                            className={
                              threat.risk_score >= 80
                                ? "text-red-600"
                                : threat.risk_score >= 60
                                ? "text-orange-600"
                                : "text-green-600"
                            }
                          >
                            {threat.risk_score}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-400 font-mono-data">
                          {new Date(threat.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          {/* Live alerts */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
              Live Security Alerts
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 h-72 overflow-y-auto space-y-3">
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-sm">Waiting for alerts...</p>
              ) : (
                alerts.map((alert) => {
                  const data = alert.message.data;
                  const type = alert.message.type;
                  const isThreat = type === "new_threat";
                  const isIncident = type === "new_incident";

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-lg border-l-2 text-sm ${
                        isThreat
                          ? "border-red-400 bg-red-50/60"
                          : "border-teal-400 bg-teal-50/60"
                      }`}
                    >
                      {isThreat && (
                        <>
                          <div className="text-red-600 font-semibold text-sm mb-1.5">
                            Threat Detected
                          </div>
                          <div className="space-y-0.5 text-slate-500">
                            <p>Event: <span className="text-slate-700">{data.event_type}</span></p>
                            <p>Severity: <span className="text-slate-700">{data.severity}</span></p>
                            <p>Risk Score: <span className="text-slate-700 font-mono-data">{data.risk_score}</span></p>
                            <p>Country: <span className="text-slate-700">{data.country}</span></p>
                          </div>
                        </>
                      )}

                      {isIncident && (
                        <>
                          <div className="text-teal-600 font-semibold text-sm mb-1.5">
                            New Incident
                          </div>
                          <div className="space-y-0.5 text-slate-500">
                            <p>Title: <span className="text-slate-700">{data.title}</span></p>
                            <p>Severity: <span className="text-slate-700">{data.severity}</span></p>
                            <p>Status: <span className="text-slate-700">{data.status}</span></p>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* System status */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
              System Status
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4">
              <div className="space-y-2.5 text-sm">
                {[
                  "Backend Online",
                  "MongoDB Connected",
                  "WebSocket Active",
                  "Threat Engine Running",
                ].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-slate-400 text-xs font-mono-data">
                last updated: {currentTime || "--:--:--"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}