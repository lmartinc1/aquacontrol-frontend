import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportesAPI, avisosAPI, tanqueAPI } from '../services/api';
import { StatCard, Spinner, BarraNivel, Badge } from '../components/UI';

export default function Dashboard() {
  const { usuario, esComite } = useAuth();
  const [resumen,  setResumen]  = useState(null);
  const [avisos,   setAvisos]   = useState([]);
  const [tanque,   setTanque]   = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resRes, aviRes, tanRes] = await Promise.allSettled([
          esComite() ? reportesAPI.resumen() : Promise.resolve(null),
          avisosAPI.listarVigentes(),
          tanqueAPI.ultimo(),
        ]);
        if (resRes.status === 'fulfilled' && resRes.value) setResumen(resRes.value.data.data);
        if (aviRes.status === 'fulfilled') setAvisos(aviRes.value.data.data || []);
        if (tanRes.status === 'fulfilled') setTanque(tanRes.value.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <Spinner texto="Cargando dashboard..." />;

  const porcentajeTanque = tanque
    ? Math.round((tanque.nivelActual / tanque.capacidad) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Bienvenido, <span className="font-medium text-agua-700">{usuario?.nombre}</span> · Comunidad San Miguel
        </p>
      </div>

      {/* Tarjetas de estadísticas (solo comité) */}
      {esComite() && resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard titulo="Hogares activos"   valor={resumen.hogaresActivos   ?? 0} icono="🏘️" color="agua" />
          <StatCard titulo="Hogares morosos"   valor={resumen.hogareMorosos    ?? 0} icono="⚠️" color="purple" />
          <StatCard titulo="Problemas activos" valor={(resumen.problemasPendientes ?? 0) + (resumen.problemasEnProceso ?? 0)} icono="🔧" color="yellow" />
          <StatCard titulo="Total hogares"     valor={resumen.totalHogares     ?? 0} icono="🏠" color="blue" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Nivel del tanque */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700 text-sm">Nivel del tanque</h2>
            <span className="text-2xl">🪣</span>
          </div>
          {tanque ? (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Nivel actual</span>
                <span className={`font-bold text-sm ${porcentajeTanque <= 10 ? 'text-red-600' : porcentajeTanque <= 30 ? 'text-yellow-600' : 'text-agua-600'}`}>
                  {porcentajeTanque}%
                </span>
              </div>
              <BarraNivel porcentaje={porcentajeTanque} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-400">Nivel actual</p>
                  <p className="font-semibold text-gray-700">{tanque.nivelActual?.toLocaleString()} gal</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-400">Capacidad</p>
                  <p className="font-semibold text-gray-700">{tanque.capacidad?.toLocaleString()} gal</p>
                </div>
              </div>
              {porcentajeTanque <= 10 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700 flex gap-1.5 items-center">
                  <span>🚨</span> Nivel crítico — menos del 10%
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">Registro: {tanque.fecha}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Sin registros de nivel</p>
          )}
        </div>

        {/* Avisos vigentes */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700 text-sm">Avisos vigentes</h2>
            <span className="text-2xl">📢</span>
          </div>
          {avisos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay avisos vigentes</p>
          ) : (
            <div className="space-y-2.5">
              {avisos.slice(0, 4).map(aviso => (
                <div key={aviso.idAviso} className="flex gap-3 p-3 bg-agua-50 rounded-lg border border-agua-100">
                  <span className="text-lg mt-0.5">📋</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{aviso.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{aviso.descripcion}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {aviso.sector
                        ? <span className="text-xs bg-agua-100 text-agua-700 px-1.5 py-0.5 rounded">{aviso.sector}</span>
                        : <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">General</span>}
                      <span className="text-xs text-gray-400">Vigente hasta: {aviso.vigencia}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estado de hogares (solo comité) */}
      {esComite() && resumen && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 text-sm mb-4">Estado general de hogares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Al día',      valor: resumen.hogaresActivos    ?? 0, badge: 'ACTIVO' },
              { label: 'Morosos',     valor: resumen.hogareMorosos     ?? 0, badge: 'MOROSO' },
              { label: 'Suspendidos', valor: resumen.hogaresSuspendidos ?? 0, badge: 'SUSPENDIDO' },
              { label: 'Pendientes',  valor: (resumen.problemasPendientes ?? 0), badge: 'PENDIENTE' },
            ].map(item => (
              <div key={item.label} className="text-center bg-gray-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-gray-800">{item.valor}</p>
                <div className="mt-2 flex justify-center"><Badge estado={item.badge} /></div>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
