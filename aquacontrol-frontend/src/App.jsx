import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Páginas
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Hogares      from './pages/Hogares';
import Aportes      from './pages/Aportes';
import Problemas    from './pages/Problemas';
import TanquePage       from './pages/TanquePage';
import DistribucionPage from './pages/DistribucionPage';
import AvisosPage       from './pages/AvisosPage';
import ReportesPage     from './pages/ReportesPage';
import MantenimientoPage from './pages/MantenimientoPage';
import UsuariosPage     from './pages/UsuariosPage';

function RutaProtegida({ children, roles }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-agua-900">
      <div className="w-10 h-10 border-4 border-agua-300 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />

      <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />

      <Route path="/hogares" element={<RutaProtegida><Hogares /></RutaProtegida>} />

      <Route path="/aportes" element={
        <RutaProtegida roles={['COMITE','REPRESENTANTE']}><Aportes /></RutaProtegida>
      } />
      <Route path="/mis-aportes" element={
        <RutaProtegida roles={['REPRESENTANTE']}><Aportes /></RutaProtegida>
      } />

      <Route path="/problemas" element={<RutaProtegida><Problemas /></RutaProtegida>} />
      <Route path="/mantenimiento" element={
        <RutaProtegida roles={['COMITE','TECNICO']}><MantenimientoPage /></RutaProtegida>
      } />

      <Route path="/distribucion" element={<RutaProtegida><DistribucionPage /></RutaProtegida>} />
      <Route path="/tanque" element={
        <RutaProtegida roles={['COMITE','TECNICO']}><TanquePage /></RutaProtegida>
      } />

      <Route path="/avisos" element={<RutaProtegida><AvisosPage /></RutaProtegida>} />
      <Route path="/reportes" element={
        <RutaProtegida roles={['COMITE']}><ReportesPage /></RutaProtegida>
      } />
      <Route path="/usuarios" element={
        <RutaProtegida roles={['COMITE']}><UsuariosPage /></RutaProtegida>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
