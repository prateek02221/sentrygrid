import { useState } from "react";
import { api } from "../services/api";

const FEATURES = [
  {
    icon: "M12 2 20 6v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z",
    title: "Real-time threat detection",
    description: "Every event is scored and correlated the instant it hits the wire.",
  },
  {
    icon: "M12 3 21 19H3L12 3Zm0 6v4m0 3h.01",
    title: "Incident response workflows",
    description: "Triage, assign, and resolve incidents without leaving the platform.",
  },
  {
    icon: "M4 19V9m6 10V5m6 14v-7m6 7V3",
    title: "Analyst-grade analytics",
    description: "Severity trends, IOC matches, and malicious IP tracking in one view.",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", { email, password });
      console.log(response.data);

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      window.location.href = "/";
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 p-12 flex-col justify-between">
        {/* Soft blurred accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
              <span className="text-teal-300 text-sm font-bold font-display">S</span>
            </div>
            <span className="text-white text-lg font-bold font-display tracking-tight">
              SentryGrid
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white font-display leading-tight mb-4">
            Security operations,<br />unified in one platform.
          </h1>

          <p className="text-slate-400 text-base leading-relaxed max-w-md">
            SentryGrid brings threat detection, incident response, and threat
            intelligence into a single real-time workspace. Built for analysts
            who need clarity under pressure — every alert, IOC, and incident
            tracked from first detection to resolution.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-teal-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4.5 h-4.5"
                >
                  <path d={feature.icon} />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{feature.title}</p>
                <p className="text-slate-500 text-sm mt-0.5">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-2 text-slate-500 text-xs font-mono-data pt-8 border-t border-white/10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400" />
          </span>
          all systems operational
        </div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Blurred blobs for mobile / right side background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-teal-200/50 blur-3xl" />
          <div className="absolute -bottom-32 right-0 w-96 h-96 rounded-full bg-cyan-100/60 blur-3xl" />
        </div>

        <form
          onSubmit={handleLogin}
          className="relative z-10 bg-white border border-slate-200 p-8 rounded-2xl w-full max-w-sm card-shadow"
        >
          <div className="lg:hidden flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-3">
              <span className="text-teal-600 text-xl font-bold font-display">S</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-display tracking-tight">
              SentryGrid
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in with your analyst credentials to continue.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wide mb-1.5">
                EMAIL
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full p-3 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 tracking-wide mb-1.5">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-500 transition-colors text-white p-3 rounded-lg font-semibold mt-6"
          >
            Sign In
          </button>

          <p className="text-center text-xs text-slate-400 mt-6">
            Access is provisioned by your administrator. Contact IT security
            if you need an account or have lost access.
          </p>
        </form>
      </div>
    </div>
  );
}