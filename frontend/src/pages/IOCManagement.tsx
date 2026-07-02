import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../services/api";
import toast from "react-hot-toast";

interface IOC {
  value: string;
  type: string;
  threat_level: string;
  description: string;
}

export default function IOCManagement() {
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [form, setForm] = useState({
    value: "",
    type: "",
    threat_level: "",
    description: "",
  });

  useEffect(() => {
    fetchIOCs();
  }, []);

  const fetchIOCs = async () => {
    try {
      const res = await api.get("/iocs/");
      setIocs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const addIOC = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/iocs/", form);

      setForm({ value: "", type: "", threat_level: "", description: "" });
      fetchIOCs();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const getThreatLevelBadge = (level: string) => {
    const key = level?.toLowerCase();
    const map: Record<string, { dot: string; text: string; bg: string }> = {
      critical: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
      high: { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
      medium: { dot: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" },
      low: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
    };
    const s = map[key] ?? { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100" };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {level || "Unknown"}
      </span>
    );
  };

  const inputClass =
    "w-full p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 font-display mb-6">
        IOC Management
      </h1>

      <form
        onSubmit={addIOC}
        className="bg-white border border-slate-200 card-shadow rounded-xl p-5 mb-8 space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="IOC Value"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="Threat Level"
            value={form.threat_level}
            onChange={(e) => setForm({ ...form, threat_level: e.target.value })}
            className={inputClass}
          />

          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-500 transition-colors px-4 py-2.5 rounded-lg text-white font-medium"
        >
          Add IOC
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">VALUE</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">TYPE</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">THREAT LEVEL</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">DESCRIPTION</th>
            </tr>
          </thead>

          <tbody>
            {iocs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-slate-400 text-sm">
                  No IOCs found
                </td>
              </tr>
            ) : (
              iocs.map((ioc, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-700 font-mono-data">{ioc.value}</td>
                  <td className="p-4 text-sm text-slate-500">{ioc.type}</td>
                  <td className="p-4">{getThreatLevelBadge(ioc.threat_level)}</td>
                  <td className="p-4 text-sm text-slate-500">{ioc.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}