import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { api } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export const AuthProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const loadUser = async () => {

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {

        setLoading(false);
        return;

      }

      try {

        const response =
          await api.get(
            "/auth/me"
          );

          console.log(response.data);

        setUser(response.data);

      } catch {

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        setUser(null);

      } finally {

        setLoading(false);

      }

    };

    loadUser();

  }, []);

  const logout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    setUser(null);

    window.location.href =
      "/login";
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>

  );
};

export const useAuth = () =>
  useContext(AuthContext);