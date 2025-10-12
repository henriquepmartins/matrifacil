"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db, CachedUser } from "../db";
import { apiClient } from "../api-client";

interface AuthContextType {
  user: CachedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CachedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Carrega a sessão ao iniciar
  useEffect(() => {
    if (initialized) return;

    const loadSession = async () => {
      try {
        console.log("🔍 Carregando sessão do IndexedDB...");
        const session = await db.sessions.toCollection().first();

        if (!session) {
          console.log("❌ Nenhuma sessão encontrada");
          setUser(null);
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        console.log("✅ Sessão encontrada:", session.id);

        // Verifica se expirou
        if (session.expiresAt < new Date()) {
          console.log("⏰ Sessão expirada");
          await db.sessions.delete(session.id);
          await db.users.clear();
          setUser(null);
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        // Carrega o usuário
        const cachedUser = await db.users.get(session.userId);
        if (cachedUser) {
          console.log("✅ Usuário carregado:", cachedUser.email);
          setUser(cachedUser);
        } else {
          console.log("❌ Usuário não encontrado no cache");
        }

        setIsLoading(false);
        setInitialized(true);
      } catch (error) {
        console.error("❌ Erro ao carregar sessão:", error);
        setUser(null);
        setIsLoading(false);
        setInitialized(true);
      }
    };

    loadSession();
  }, [initialized]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Fazendo login...");
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      console.log("✅ Login bem-sucedido:", response.data.user.email);

      // Salva no IndexedDB
      const userData = {
        ...response.data.user,
        role: response.data.user.role || "RECEPCAO",
        createdAt: new Date(response.data.user.createdAt || Date.now()),
        updatedAt: new Date(response.data.user.updatedAt || Date.now()),
      };

      const sessionData = {
        id: response.data.user.id,
        userId: response.data.user.id,
        token: response.data.token,
        expiresAt: new Date(response.data.expiresAt),
        createdAt: new Date(),
      };

      console.log("💾 Salvando no IndexedDB...");
      await db.users.put(userData);
      await db.sessions.put(sessionData);
      console.log("✅ Dados salvos no IndexedDB");

      // Atualiza o estado
      setUser(userData);
    } catch (error: any) {
      console.error("❌ Erro no login:", error);
      throw new Error(error?.message || "Erro ao fazer login");
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log("📝 Registrando usuário...");
      const response = await apiClient.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      console.log("✅ Registro bem-sucedido:", response.data.user.email);

      // Salva no IndexedDB
      const userData = {
        ...response.data.user,
        role: response.data.user.role || "RECEPCAO",
        createdAt: new Date(response.data.user.createdAt || Date.now()),
        updatedAt: new Date(response.data.user.updatedAt || Date.now()),
      };

      const sessionData = {
        id: response.data.user.id,
        userId: response.data.user.id,
        token: response.data.token,
        expiresAt: new Date(response.data.expiresAt),
        createdAt: new Date(),
      };

      console.log("💾 Salvando no IndexedDB...");
      await db.users.put(userData);
      await db.sessions.put(sessionData);
      console.log("✅ Dados salvos no IndexedDB");

      // Atualiza o estado
      setUser(userData);
    } catch (error: any) {
      console.error("❌ Erro no registro:", error);
      throw new Error(error?.message || "Erro ao registrar");
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Fazendo logout...");
      await apiClient.post("/api/auth/logout");
    } catch (error) {
      console.error("⚠️ Erro ao fazer logout no servidor:", error);
    } finally {
      console.log("🗑️ Limpando dados locais...");
      await db.sessions.clear();
      await db.users.clear();
      setUser(null);
      console.log("✅ Logout concluído");
    }
  };

  const refreshSession = async () => {
    try {
      console.log("🔄 Atualizando sessão...");
      const response = await apiClient.get("/api/auth/session");

      const userData = {
        ...response.data.user,
        role: response.data.user.role || "RECEPCAO",
        createdAt: new Date(response.data.user.createdAt || Date.now()),
        updatedAt: new Date(response.data.user.updatedAt || Date.now()),
      };

      await db.users.put(userData);
      setUser(userData);
      console.log("✅ Sessão atualizada");
    } catch (error) {
      console.error("❌ Erro ao atualizar sessão:", error);
      await signOut();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
