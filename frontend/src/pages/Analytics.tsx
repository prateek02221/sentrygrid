import { useEffect, useState } from "react";
import { api, getThreatIntelSummary, getTopMaliciousIPs, getWebSocketUrl } from "../services/api";
import { Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import StatCard from "../components/StatCard";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Analytics() {
  const [severityData, setSeverityData] = useState<any>(null);
  const [threatTypeData, setThreatTypeData] = useState<any>(null);
  const [intelSummary, setIntelSummary] = useState<any>(null);
  const [topIPs, setTopIPs] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();

    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      console.log("Analytics WebSocket Connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "new_threat") {
        loadAnalytics();
      }

      if (message.type === "new_incident") {
        loadAnalytics();
      }
    };

    ws.onclose = () => {
      console.log("Analytics WebSocket Closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const loadAnalytics = async () => {
    try {
      const severityResponse = await api.get("/dashboard/severity-distribution");
      const threatResponse = await api.get("/dashboard/threat-type-distribution");
      const intelResponse = await getThreatIntelSummary();
      const topIPResponse = await getTopMaliciousIPs();

      setSeverityData(severityResponse.data);
      setThreatTypeData(threatResponse.data);
      setIntelSummary(intelResponse);
      setTopIPs(topIPResponse);
    } catch (error) {
      console.error(error);
    }
  };

  const chartLegendOptions = {
    plugins: {
      legend: {
        labels: { color: "#475569" },
      },
    },
  };

  const severityChart = {
    labels: severityData ? Object.keys(severityData) : [],
    datasets: [
      {
        data: severityData ? Object.values(severityData) : [],
        backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const threatChart = {
    labels: threatTypeData ? Object.keys(threatTypeData) : [],
    datasets: [
      {
        data: threatTypeData ? Object.values(threatTypeData) : [],
        backgroundColor: ["#14b8a6", "#8b5cf6", "#f97316", "#ef4444", "#22c55e", "#eab308"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 font-display mb-6">
        Analytics
      </h1>

      {intelSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total IOCs" value={intelSummary.total_iocs} accent="teal" />
          <StatCard label="IOC Matches" value={intelSummary.ioc_matches} accent="red" />
          <StatCard label="Critical Incidents" value={intelSummary.critical_incidents} accent="orange" />
          <StatCard label="Match Rate" value={`${intelSummary.match_rate}%`} accent="green" />
        </div>
      )}

      <div className="bg-white border border-slate-200 card-shadow rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
          Top Malicious IPs
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-xs font-semibold text-slate-500 tracking-wide">IP ADDRESS</th>
              <th className="text-left py-2 text-xs font-semibold text-slate-500 tracking-wide">IOC HITS</th>
            </tr>
          </thead>

          <tbody>
            {topIPs.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-6 text-slate-400 text-sm">
                  No data yet
                </td>
              </tr>
            ) : (
              topIPs.map((ip, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-2.5 text-sm text-slate-700 font-mono-data">{ip.ip_address}</td>
                  <td className="py-2.5 text-sm text-slate-500 font-mono-data">{ip.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 card-shadow rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
            Severity Distribution
          </h2>

          {severityData && <Pie data={severityChart} options={chartLegendOptions} />}
        </div>

        <div className="bg-white border border-slate-200 card-shadow rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
            Threat Type Distribution
          </h2>

          {threatTypeData && <Doughnut data={threatChart} options={chartLegendOptions} />}
        </div>
      </div>
    </div>
  );
}