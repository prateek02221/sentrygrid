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

interface IncidentModalProps {
  incident: Incident;
  onClose: () => void;
}

export default function IncidentModal({
  incident,
  onClose,
}: IncidentModalProps) {

  if (!incident) return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/70
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div
        className="
          bg-slate-900
          border
          border-slate-700
          p-6
          rounded-lg
          w-[700px]
          max-h-[90vh]
          overflow-y-auto
          shadow-2xl
        "
      >
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-white">
            Incident Details
          </h2>

          <button
            onClick={onClose}
            className="
              text-red-400
              hover:text-red-300
              text-xl
            "
          >
            ✕
          </button>

        </div>

        <div className="space-y-5">

          <div>
            <p className="text-cyan-400 font-semibold">
              Title
            </p>

            <p className="text-white mt-1">
              {incident.title}
            </p>
          </div>

          <div>
            <p className="text-cyan-400 font-semibold">
              Description
            </p>

            <p className="text-white mt-1">
              {incident.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-cyan-400 font-semibold">
                Event Type
              </p>

              <p className="text-white mt-1">
                {incident.event_type}
              </p>
            </div>

            <div>
              <p className="text-cyan-400 font-semibold">
                Severity
              </p>

              <p className="text-white mt-1">
                {incident.severity}
              </p>
            </div>

            <div>
              <p className="text-cyan-400 font-semibold">
                Status
              </p>

              <p className="text-white mt-1">
                {incident.status}
              </p>
            </div>

            <div>
              <p className="text-cyan-400 font-semibold">
                Created
              </p>

              <p className="text-white mt-1">
                {new Date(
                  incident.created_at
                ).toLocaleString()}
              </p>
            </div>

          </div>

          <div>

            <p className="text-cyan-400 font-semibold mb-2">
              Analyst Notes
            </p>

            {incident.analyst_notes?.length > 0 ? (

              <div className="space-y-2">

                {incident.analyst_notes.map(
                  (
                    note,
                    index
                  ) => (
                    <div
                      key={index}
                      className="
                        bg-slate-800
                        border
                        border-slate-700
                        p-3
                        rounded
                        text-white
                      "
                    >
                      {note}
                    </div>
                  )
                )}

              </div>

            ) : (

              <div
                className="
                  bg-slate-800
                  border
                  border-slate-700
                  p-3
                  rounded
                  text-slate-400
                "
              >
                No analyst notes available
              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}