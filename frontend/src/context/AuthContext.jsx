import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(() => Boolean(localStorage.getItem('token')));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setLoadingUser(false);
  }, []);

  const fetchUserProfile = useCallback(async (token) => {
    if (!token) {
      setLoadingUser(false);
      return;
    }
    setLoadingUser(true);
    try {
      const response = await fetch('http://localhost:8081/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401 || response.status === 403) {
        logout();
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    } finally {
      setLoadingUser(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile(token);
    }
  }, [fetchUserProfile]);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    fetchUserProfile(token);
  };

  const refreshUser = () => {
    const token = localStorage.getItem('token');
    if (token) {
      return fetchUserProfile(token);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, loadingUser, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
