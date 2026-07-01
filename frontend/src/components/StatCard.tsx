interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  accent?: "teal" | "red" | "yellow" | "green" | "orange" | "violet";
}

const ACCENTS = {
  teal: { text: "text-teal-600", ring: "border-teal-200", bg: "bg-teal-50" },
  red: { text: "text-red-600", ring: "border-red-200", bg: "bg-red-50" },
  yellow: { text: "text-yellow-600", ring: "border-yellow-200", bg: "bg-yellow-50" },
  green: { text: "text-green-600", ring: "border-green-200", bg: "bg-green-50" },
  orange: { text: "text-orange-600", ring: "border-orange-200", bg: "bg-orange-50" },
  violet: { text: "text-violet-600", ring: "border-violet-200", bg: "bg-violet-50" },
};

export default function StatCard({
  label,
  value,
  icon,
  accent = "teal",
}: StatCardProps) {
  const a = ACCENTS[accent];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 card-shadow hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-500 text-sm">{label}</h3>
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg ${a.bg} border ${a.ring} flex items-center justify-center ${a.text}`}
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
              <path d={icon} />
            </svg>
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold font-mono-data tabular-nums ${a.text}`}>
        {value}
      </p>
    </div>
  );
}