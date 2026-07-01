import { useEffect, useState } from "react";
import { api } from "../services/api";
import StatCard from "../components/StatCard";

interface Summary {
  total_iocs: number;
  total_threats: number;
  ioc_matches: number;
  critical_incidents: number;
  match_rate: number;
}

export default function ThreatIntelligence() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [topIps, setTopIps] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const summaryRes = await api.get("/threat-intelligence/summary", { headers });
      const ipsRes = await api.get("/threat-intelligence/top-malicious-ips", { headers });

      setSummary(summaryRes.data);
      setTopIps(ipsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 font-display mb-6">
        Threat Intelligence
      </h1>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total IOCs" value={summary.total_iocs} accent="teal" />
          <StatCard label="Total Threats" value={summary.total_threats} accent="violet" />
          <StatCard label="IOC Matches" value={summary.ioc_matches} accent="red" />
          <StatCard label="Critical Incidents" value={summary.critical_incidents} accent="orange" />
          <StatCard label="Match Rate" value={`${summary.match_rate}%`} accent="green" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Top Malicious IPs
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">IP ADDRESS</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">COUNT</th>
            </tr>
          </thead>

          <tbody>
            {topIps.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-8 text-slate-400 text-sm">
                  No data yet
                </td>
              </tr>
            ) : (
              topIps.map((ip, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-700 font-mono-data">{ip.ip_address}</td>
                  <td className="p-4 text-sm text-slate-500 font-mono-data">{ip.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}