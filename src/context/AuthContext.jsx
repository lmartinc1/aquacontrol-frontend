import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:8080/api';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('ac_token'));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tokenGuardado   = localStorage.getItem('ac_token');
    const usuarioGuardado = localStorage.getItem('ac_usuario');
    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`;
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    const { token: t, ...datos } = res.data.data;
    setToken(t);
    setUsuario(datos);
    localStorage.setItem('ac_token', t);
    localStorage.setItem('ac_usuario', JSON.stringify(datos));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return datos;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('ac_token');
    localStorage.removeItem('ac_usuario');
    delete axios.defaults.headers.common['Authorization'];
  };

  const esComite      = () => usuario?.rol === 'COMITE';
  const esTecnico     = () => usuario?.rol === 'TECNICO';
  const esRepresentante = () => usuario?.rol === 'REPRESENTANTE';

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout, esComite, esTecnico, esRepresentante }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API_BASE };
