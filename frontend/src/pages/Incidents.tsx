import { useEffect, useState } from "react";
import { api, getWebSocketUrl, getErrorMessage } from "../services/api";
import toast from "react-hot-toast";
import IncidentModal from "../components/IncidentModal";

interface Incident {
  _id: string;
  threat_id: string;
  event_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  analyst_notes: string[];
  created_at: string;
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});

  useEffect(() => {
    loadIncidents();

    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      console.log("Incident WebSocket Connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Incident WS:", message);

      if (message.type === "new_incident") {
        toast.error("New Incident Created");
        loadIncidents();
      }

      if (message.type === "incident_status_updated") {
        toast.success(`Incident ${message.data.status}`);
        loadIncidents();
      }
    };

    ws.onclose = () => {
      console.log("Incident WebSocket Closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const loadIncidents = async () => {
    try {
      const response = await api.get("/incidents/");
      setIncidents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const resolveIncident = async (incidentId: string) => {
    try {
      await api.put(`/incidents/${incidentId}/resolve`);
      toast.success("Incident Resolved Successfully");
      loadIncidents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve incident");
    }
  };

  const addNote = async (incidentId: string) => {
    const note = noteText[incidentId];

    if (!note?.trim()) {
      toast.error("Enter a note first");
      return;
    }

    try {
      await api.put(`/incidents/${incidentId}/add-note`, { note });
      toast.success("Note Added Successfully");
      setNoteText((prev) => ({ ...prev, [incidentId]: "" }));
      loadIncidents();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add note");
    }
  };

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

  const getStatusBadge = (status: string) => {
    const map: Record<string, { dot: string; text: string; bg: string; label: string }> = {
      resolved: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50", label: "Resolved" },
      investigating: { dot: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50", label: "Investigating" },
    };
    const s = map[status] ?? { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", label: "Open" };

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
        Incident Management
      </h1>

      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">TITLE</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">SEVERITY</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">STATUS</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">EVENT TYPE</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">ANALYST NOTES</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">CREATED</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-slate-400 text-sm">
                  No incidents found
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr
                  key={incident._id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-700">{incident.title}</td>
                  <td className="p-4">{getSeverityBadge(incident.severity)}</td>
                  <td className="p-4">{getStatusBadge(incident.status)}</td>
                  <td className="p-4 text-sm text-slate-500">{incident.event_type}</td>

                  <td className="p-4">
                    <div className="space-y-2 min-w-[180px]">
                      <input
                        type="text"
                        placeholder="Add note..."
                        value={noteText[incident._id] || ""}
                        onChange={(e) =>
                          setNoteText((prev) => ({
                            ...prev,
                            [incident._id]: e.target.value,
                          }))
                        }
                        className="bg-white border border-slate-200 text-slate-800 text-sm px-3 py-2 rounded-lg w-full placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                      />

                      <button
                        onClick={() => addNote(incident._id)}
                        className="bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-lg text-teal-700 text-sm font-medium w-full transition-colors"
                      >
                        Add Note
                      </button>
                    </div>
                  </td>

                  <td className="p-4 text-sm text-slate-400 font-mono-data">
                    {new Date(incident.created_at).toLocaleString()}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="bg-white hover:border-teal-400 border border-slate-200 px-3.5 py-2 rounded-lg text-slate-700 text-sm font-medium transition-colors"
                      >
                        View
                      </button>

                      {incident.status !== "resolved" ? (
                        <button
                          onClick={() => resolveIncident(incident._id)}
                          className="bg-green-50 hover:bg-green-100 border border-green-200 px-3.5 py-2 rounded-lg text-green-700 text-sm font-medium transition-colors"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-green-700 text-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}