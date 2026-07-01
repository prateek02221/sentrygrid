import axios from "axios";

// In production (single-service deploy), the frontend is served by the
// same FastAPI process as the API, so a relative path is correct.
// For local development, set VITE_API_URL in frontend/.env.development
// to point at the backend running separately (e.g. http://127.0.0.1:8000/api/v1).
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Builds the websocket URL the same way: explicit override for local dev
// (frontend and backend run on different ports), otherwise derived from
// the current page's origin so it works automatically in production
// behind https/wss.
export const getWebSocketUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/alerts`;
};

// Attach the access token to every request automatically, so pages no
// longer need to build headers manually.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401, try refreshing the access token once and retrying the
// original request. If that fails, clear auth state and send the user
// to /login.
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh when the failing call is itself the login/refresh endpoint.
    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Wait for the in-flight refresh to finish, then retry with its result.
      return new Promise((resolve, reject) => {
        refreshWaiters.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refresh_token: refreshToken }
      );

      localStorage.setItem("access_token", data.access_token);
      refreshWaiters.forEach((cb) => cb(data.access_token));
      refreshWaiters = [];

      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshWaiters.forEach((cb) => cb(null));
      refreshWaiters = [];

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Extracts a human-readable message from a FastAPI error response.
// Handles both simple string `detail` and Pydantic's list-of-validation-error format:
// { "detail": [{ "type": ..., "loc": ["body", "name"], "msg": "...", ... }] }
export const getErrorMessage = (error: any): string => {
  const detail = error?.response?.data?.detail;

  if (!detail) {
    return error?.message || "Something went wrong. Please try again.";
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : "";
        return field ? `${field}: ${err.msg}` : err.msg;
      })
      .join(", ");
  }

  return "Something went wrong. Please try again.";
};

export const getThreatIntelSummary = async () => {
  const response = await api.get(
    "/threat-intelligence/summary"
  );
  return response.data;
};

export const getTopMaliciousIPs = async () => {
  const response = await api.get(
    "/threat-intelligence/top-malicious-ips"
  );
  return response.data;
};

export const getThreatTypes = async () => {
  const response = await api.get(
    "/threat-intelligence/threat-types"
  );
  return response.data;
};