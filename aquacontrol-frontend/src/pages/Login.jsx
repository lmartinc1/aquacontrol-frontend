import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconoAgua = () => (
  <svg viewBox="0 0 80 80" className="w-16 h-16 mx-auto" fill="none">
    <path d="M40 8 C40 8 16 32 16 48 C16 62.4 26.8 72 40 72 C53.2 72 64 62.4 64 48 C64 32 40 8 40 8Z"
      fill="#3fa6eb" opacity="0.25"/>
    <path d="M40 16 C40 16 20 36 20 50 C20 62 29 70 40 70 C51 70 60 62 60 50 C60 36 40 16 40 16Z"
      fill="#1a8fd1" opacity="0.5"/>
    <path d="M40 26 C40 26 26 42 26 52 C26 60 32.3 66 40 66 C47.7 66 54 60 54 52 C54 42 40 26 40 26Z"
      fill="#0d5278" opacity="0.85"/>
    <ellipse cx="34" cy="48" rx="4" ry="6" fill="white" opacity="0.35" transform="rotate(-20 34 48)"/>
  </svg>
);

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Completa todos los campos.'); return; }
    setCargando(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agua-900 via-agua-800 to-agua-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo y nombre */}
        <div className="text-center mb-8">
          <IconoAgua />
          <h1 className="text-3xl font-bold text-white mt-4">AquaControl</h1>
          <p className="text-agua-200 text-sm mt-1">Sistema de Gestión del Agua · San Miguel</p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-lg font-semibold text-gray-800 mb-5 text-center">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 flex gap-2 items-start">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="input-field"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Ingresando...</>
              ) : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-agua-300 text-xs mt-6">
          Universidad Mariano Gálvez · Proyecto III · v1.0.0
        </p>
      </div>
    </div>
  );
}
