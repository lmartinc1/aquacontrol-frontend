import React, { useEffect, useState } from 'react';
import { reportesAPI } from '../services/api';
import { Spinner, Badge } from '../components/UI';

export default function Reportes() {
  const [resumen,       setResumen]       = useState(null);
  const [aportes,       setAportes]       = useState(null);
  const [mantenimiento, setMantenimiento] = useState([]);
  const [cargando,      setCargando]      = useState(true);

  useEffect(() => {
    Promise.allSettled([reportesAPI.resumen(), reportesAPI.aportes(), reportesAPI.mantenimiento()])
      .then(([r, a, m]) => {
        if (r.status === 'fulfilled') setResumen(r.value.data.data);
        if (a.status === 'fulfilled') setAportes(a.value.data.data);
        if (m.status === 'fulfilled') setMantenimiento(m.value.data.data || []);
      }).finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="card max-w-5xl"><Spinner texto="Generando reportes..." /></div>;

  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes administrativos</h1>
        <p className="text-gray-500 text-sm">Vista consolidada del estado del sistema</p>
      </div>

      {resumen && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">🏘️ Estado general de hogares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l:'Total hogares',   v: resumen.totalHogares,      c:'text-agua-600',   bg:'bg-agua-50' },
              { l:'Al día',          v: resumen.hogaresActivos,     c:'text-green-600',  bg:'bg-green-50' },
              { l:'Morosos',         v: resumen.hogareMorosos,      c:'text-purple-600', bg:'bg-purple-50' },
              { l:'Suspendidos',     v: resumen.hogaresSuspendidos, c:'text-red-600',    bg:'bg-red-50' },
            ].map(item => (
              <div key={item.l} className={`${item.bg} rounded-xl p-4 text-center`}>
                <p className={`text-3xl font-bold ${item.c}`}>{item.v ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {aportes && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">💰 Reporte de aportes</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l:'Total registros', v: aportes.totalAportes, c:'text-agua-600',   bg:'bg-agua-50' },
              { l:'Pagados',         v: aportes.pagados,      c:'text-green-600',  bg:'bg-green-50' },
              { l:'Pendientes',      v: aportes.pendientes,   c:'text-yellow-600', bg:'bg-yellow-50' },
            ].map(item => (
              <div key={item.l} className={`${item.bg} rounded-xl p-4 text-center`}>
                <p className={`text-3xl font-bold ${item.c}`}>{item.v ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {resumen && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">⚠️ Resumen de incidencias</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { l:'Pendientes',  v: resumen.problemasPendientes,  c:'text-red-600',    bg:'bg-red-50' },
              { l:'En proceso',  v: resumen.problemasEnProceso,   c:'text-yellow-600', bg:'bg-yellow-50' },
              { l:'Resueltos',   v: resumen.problemasResueltos,   c:'text-green-600',  bg:'bg-green-50' },
            ].map(item => (
              <div key={item.l} className={`${item.bg} rounded-xl p-4 text-center`}>
                <p className={`text-3xl font-bold ${item.c}`}>{item.v ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">{item.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {resumen?.nivelTanque !== undefined && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">🪣 Estado del tanque</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-agua-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-agua-600">{Math.round(resumen.porcentajeTanque ?? 0)}%</p>
              <p className="text-xs text-gray-500 mt-1">Nivel actual</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-gray-700">{resumen.nivelTanque?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Galones actuales</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-gray-700">{resumen.capacidadTanque?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Capacidad total</p>
            </div>
          </div>
          {resumen.nivelCritico && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              🚨 Nivel crítico del tanque detectado
            </div>
          )}
        </div>
      )}

      {mantenimiento.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">🔧 Historial de mantenimientos (últimos 10)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Descripción</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
              </tr></thead>
              <tbody>
                {mantenimiento.slice(0, 10).map(m => (
                  <tr key={m.idMantenimiento} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-700">{m.fecha}</td>
                    <td className="px-4 py-2.5 text-gray-600">{m.tipoActividad}</td>
                    <td className="px-4 py-2.5 text-gray-600 max-w-[200px] truncate">{m.descripcion || '—'}</td>
                    <td className="px-4 py-2.5"><Badge estado={m.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
