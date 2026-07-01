import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../services/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Mirrors the backend's Pydantic constraints so users get instant
  // feedback instead of a round-trip to the server.
  const validateNewUser = (): string | null => {
    if (newUser.name.trim().length < 3) {
      return "Name must be at least 3 characters";
    }
    if (newUser.password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (newUser.password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      console.log("Users After Refresh:", res.data);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateNewUser();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await api.post("/auth/register", newUser);

      setNewUser({ name: "", email: "", password: "", role: "viewer" });
      setConfirmPassword("");

      await fetchUsers();
      toast.success("User Created Successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });

      console.log("Role Update Response:", response.data);

      await fetchUsers();
      toast.success("Role Updated");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const toggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/users/${userId}/status`, { is_active: !isActive });

      await fetchUsers();

      toast.success(isActive ? "User Disabled" : "User Enabled");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);

      await fetchUsers();

      toast.success("User Deleted Successfully");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error));
    }
  };

  const inputClass =
    "bg-white border border-slate-200 text-slate-800 text-sm p-2.5 rounded-lg placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 font-display mb-6">
        User Management
      </h1>

      {/* Create User Form */}
      <div className="bg-white border border-slate-200 card-shadow rounded-xl p-5 mb-8">
        <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
          Create User
        </h2>

        <form onSubmit={createUser} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className={inputClass}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className={inputClass}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className={inputClass}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            required
          />

          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className={inputClass}
          >
            <option value="admin">Admin</option>
            <option value="security_analyst">Security Analyst</option>
            <option value="viewer">Viewer</option>
          </select>

          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-500 transition-colors px-4 py-2.5 rounded-lg text-white font-medium sm:col-span-3 lg:col-span-5"
          >
            Create User
          </button>
        </form>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">NAME</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">EMAIL</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">ROLE</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">STATUS</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 tracking-wide">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-slate-400 text-sm">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-700">{user.name}</td>
                  <td className="p-4 text-sm text-slate-500">{user.email}</td>

                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="bg-white border border-slate-200 text-sm text-slate-700 p-1.5 rounded-lg focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="admin">Admin</option>
                      <option value="security_analyst">Security Analyst</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.is_active ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {user.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(user.id, user.is_active)}
                        className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-3 py-1.5 rounded-lg text-yellow-700 text-xs font-medium transition-colors"
                      >
                        {user.is_active ? "Disable" : "Enable"}
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-red-700 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}