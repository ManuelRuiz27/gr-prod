import React, { createContext, useContext, useState } from 'react';
import { authApi, type LoginResult, type RegisterGraduateInput } from '../services/api';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../lib/storage';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'GRADUATE';
  status: string;
}

export interface MembershipInfo {
  id: string;
  event_id: string;
  status: string;
  active_places: number;
  event?: {
    id: string;
    name: string;
    date: string;
    venue: string;
    status: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  memberships: MembershipInfo[];
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterGraduateInput) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  memberships: [],
  login: async () => ({} as LoginResult),
  register: async () => ({} as LoginResult),
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = safeGetItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => safeGetItem('token'));
  const [memberships, setMemberships] = useState<MembershipInfo[]>(() => {
    const saved = safeGetItem('memberships');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);
      const { accessToken, refreshToken, user: authUser, memberships: authMemberships } = result;

      setToken(accessToken);
      setUser(authUser);
      setMemberships(authMemberships || []);

      safeSetItem('token', accessToken);
      if (refreshToken) safeSetItem('refreshToken', refreshToken);
      safeSetItem('user', JSON.stringify(authUser));
      if (authMemberships) safeSetItem('memberships', JSON.stringify(authMemberships));

      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (data: RegisterGraduateInput) => {
    try {
      const result = await authApi.registerGraduate(data);
      const { accessToken, refreshToken, user: authUser, memberships: authMemberships } = result;

      setToken(accessToken);
      setUser(authUser);
      setMemberships(authMemberships || []);

      safeSetItem('token', accessToken);
      if (refreshToken) safeSetItem('refreshToken', refreshToken);
      safeSetItem('user', JSON.stringify(authUser));
      if (authMemberships) safeSetItem('memberships', JSON.stringify(authMemberships));

      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrarse');
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setToken(null);
    setUser(null);
    setMemberships([]);
    safeRemoveItem('token');
    safeRemoveItem('refreshToken');
    safeRemoveItem('user');
    safeRemoveItem('memberships');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        memberships,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};
