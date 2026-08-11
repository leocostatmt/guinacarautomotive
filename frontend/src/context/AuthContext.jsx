import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Novo estado para guardar os dados do usuário

  // Verifica o token ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile(token);
    }
  }, []);

  // Busca os dados do usuário no Spring Boot
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData); 
      } else {
        // Se o token for inválido/expirado, limpa a sessão
        logout(); 
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    fetchUserProfile(token); // Busca os dados logo após logar
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null); // Limpa os dados
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);