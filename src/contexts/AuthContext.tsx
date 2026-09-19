import { createContext, useEffect, useState, type ReactNode } from "react";
import type { LoginFormValues } from "../features/auth/Schemas";
import { api } from "../services/Services";

interface User {
  id: string;
  name: string;
  email: string;
  foto?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleLogin: (data: LoginFormValues) => Promise<void>;
  handleLogout: () => void;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const recoveredUser = localStorage.getItem("@MyGastronomy:user");
    const recoveredToken = localStorage.getItem("@MyGastronomy:token");

    if (recoveredUser && recoveredUser !== "undefined" && recoveredToken) {
      try {

        const parsedUser = JSON.parse(recoveredUser);
        setUser(parsedUser);

        api.defaults.headers.common["Authorization"] = `Bearer ${recoveredToken}`;
      } catch (error) {
        console.error("Bug ao ler o usuário do localStorage. Limpando a sessão...", error);
        localStorage.removeItem("@MyGastronomy:user");
        localStorage.removeItem("@MyGastronomy:token");
      }
    }
  }, []);

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", data);
      
      const token = response.data.token || response.data.access_token;
      const userData = response.data.user || null; // Corrigido de uscr para user

      if (!token) {
        throw new Error("O backend não retornou um token válido de autenticação.");
      }

      localStorage.setItem("@MyGastronomy:token", token);
      
      if (userData) {
        localStorage.setItem("@MyGastronomy:user", JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem("@MyGastronomy:user");
        setUser(null);
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    } catch (error) {
      console.error("Erro no login:", error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("@MyGastronomy:token");
    localStorage.removeItem("@MyGastronomy:user");
    api.defaults.headers.common["Authorization"] = "";
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}