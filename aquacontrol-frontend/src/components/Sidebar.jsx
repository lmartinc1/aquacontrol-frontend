import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconoAgua = () => (
  <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
    <path d="M20 4 C20 4 8 16 8 24 C8 31.2 13.4 36 20 36 C26.6 36 32 31.2 32 24 C32 16 20 4 20 4Z"
      fill="#3fa6eb" opacity="0.3"/>
    <path d="M20 8 C20 8 10 18 10 25 C10 31 14.5 35 20 35 C25.5 35 30 31 30 25 C30 18 20 8 20 8Z"
      fill="#1a8fd1" opacity="0.6"/>
    <path d="M20 13 C20 13 13 21 13 26 C13 30 16.1 33 20 33 C23.9 33 27 30 27 26 C27 21 20 13 20 13Z"
      fill="white" opacity="0.9"/>
    <ellipse cx="17" cy="24" rx="2" ry="3" fill="#1a8fd1" opacity="0.4" transform="rotate(-20 17 24)"/>
  </svg>
);

const menuComite = [
  { to: '/dashboard',     label: 'Inicio',            icono: '🏠' },
  { to: '/hogares',       label: 'Hogares',            icono: '🏘️' },
  { to: '/aportes',       label: 'Aportes',            icono: '💰' },
  { to: '/problemas',     label: 'Incidencias',        icono: '⚠️' },
  { to: '/mantenimiento', label: 'Mantenimiento',      icono: '🔧' },
  { to: '/distribucion',  label: 'Distribución',       icono: '🚿' },
  { to: '/tanque',        label: 'Nivel del tanque',   icono: '🪣' },
  { to: '/avisos',        label: 'Avisos',             icono: '📢' },
  { to: '/reportes',      label: 'Reportes',           icono: '📊' },
  { to: '/usuarios',      label: 'Usuarios',           icono: '👥' },
];

const menuTecnico = [
  { to: '/dashboard',     label: 'Inicio',       icono: '🏠' },
  { to: '/problemas',     label: 'Incidencias',  icono: '⚠️' },
  { to: '/mantenimiento', label: 'Mantenimiento', icono: '🔧' },
  { to: '/tanque',        label: 'Nivel del tanque', icono: '🪣' },
];

const menuRepresentante = [
  { to: '/dashboard',    label: 'Inicio',         icono: '🏠' },
  { to: '/mis-aportes',  label: 'Mis aportes',    icono: '💰' },
  { to: '/distribucion', label: 'Distribución',   icono: '🚿' },
  { to: '/problemas',    label: 'Reportar problema', icono: '⚠️' },
  { to: '/avisos',       label: 'Avisos',         icono: '📢' },
];

export default function Sidebar({ abierto, setAbierto }) {
  const { usuario, logout, esComite, esTecnico } = useAuth();
  const navigate = useNavigate();

  const menu = esComite() ? menuComite : esTecnico() ? menuTecnico : menuRepresentante;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rolLabel = {
    COMITE: 'Comité comunitario',
    TECNICO: 'Técnico de mantenimiento',
    REPRESENTANTE: 'Representante del hogar',
  }[usuario?.rol] || '';

  return (
    <>
      {/* Overlay móvil */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-agua-800 text-white z-30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${abierto ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header del sidebar */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-agua-700">
          <IconoAgua />
          <div>
            <h1 className="font-bold text-lg leading-tight">AquaControl</h1>
            <p className="text-agua-300 text-xs">Proyecto III · Release 1</p>
          </div>
          <button
            className="ml-auto lg:hidden text-agua-300 hover:text-white"
            onClick={() => setAbierto(false)}
          >✕</button>
        </div>

        {/* Info usuario */}
        <div className="px-5 py-3 bg-agua-900 border-b border-agua-700">
          <p className="text-xs text-agua-300 uppercase tracking-wide font-medium">{rolLabel}</p>
          <p className="text-sm font-semibold text-white truncate mt-0.5">{usuario?.nombre}</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {menu.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-agua-600 text-white shadow-sm'
                  : 'text-agua-200 hover:bg-agua-700 hover:text-white'}`
              }
            >
              <span className="text-base">{item.icono}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Botón cerrar sesión */}
        <div className="p-3 border-t border-agua-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-agua-200 hover:bg-red-700 hover:text-white transition-all duration-150"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
