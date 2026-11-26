import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      setIsLoggedIn(false);
      setUser(null);
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
        setIsLoggedIn(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Erro ao validar sessão do usuário:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoadingUser(false);
    }
  }, [fetchUserProfile]);

  const login = (token, initialUser = null) => {
    localStorage.setItem('token', token);
    if (initialUser) {
      setUser(initialUser);
      setIsLoggedIn(true);
      setLoadingUser(false);
    }
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
