import React from 'react';

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-agua-600">
      <div className="w-8 h-8 border-4 border-agua-200 border-t-agua-600 rounded-full animate-spin" />
      <span className="text-sm text-gray-500">{texto}</span>
    </div>
  );
}

// ── Badge de estado ────────────────────────────────────────
export function Badge({ estado }) {
  const clases = {
    ACTIVO:      'badge-activo',
    MOROSO:      'badge-moroso',
    SUSPENDIDO:  'badge-suspendido',
    INACTIVO:    'badge-inactivo',
    PENDIENTE:   'badge-pendiente',
    PAGADO:      'badge-pagado',
    RESUELTO:    'badge-resuelto',
    EN_PROCESO:  'badge-en_proceso',
    CANCELADO:   'badge-inactivo',
    COMPLETADO:  'badge-resuelto',
    PROGRAMADO:  'badge-pendiente',
  };
  const etiquetas = {
    ACTIVO: 'Al día', MOROSO: 'Moroso', SUSPENDIDO: 'Suspendido',
    INACTIVO: 'Inactivo', PENDIENTE: 'Pendiente', PAGADO: 'Pagado',
    RESUELTO: 'Resuelto', EN_PROCESO: 'En proceso', CANCELADO: 'Cancelado',
    COMPLETADO: 'Completado', PROGRAMADO: 'Programado',
  };
  return (
    <span className={clases[estado] || 'badge-inactivo'}>
      {etiquetas[estado] || estado}
    </span>
  );
}

// ── Tarjeta estadística ────────────────────────────────────
export function StatCard({ titulo, valor, icono, color = 'blue', subtitulo }) {
  const colores = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    green:  'bg-green-50 text-green-600 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    agua:   'bg-agua-50 text-agua-600 border-agua-100',
  };
  return (
    <div className={`card border ${colores[color].split(' ')[2]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{titulo}</p>
          <p className={`text-3xl font-bold mt-1 ${colores[color].split(' ')[1]}`}>{valor}</p>
          {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
        </div>
        <div className={`p-2.5 rounded-lg text-2xl ${colores[color].split(' ')[0]}`}>{icono}</div>
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────
export function Modal({ titulo, onClose, children, ancho = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full ${ancho} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">{titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── Estado vacío ─────────────────────────────────────────
export function EmptyState({ mensaje = 'No hay datos disponibles', icono = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
      <span className="text-4xl">{icono}</span>
      <p className="text-sm">{mensaje}</p>
    </div>
  );
}

// ── Alerta ───────────────────────────────────────────────
export function Alerta({ tipo = 'error', mensaje, onClose }) {
  const estilos = {
    error:   'bg-red-50 text-red-700 border-red-200',
    exito:   'bg-green-50 text-green-700 border-green-200',
    info:    'bg-blue-50 text-blue-700 border-blue-200',
    alerta:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  const iconos = { error: '❌', exito: '✅', info: 'ℹ️', alerta: '⚠️' };
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${estilos[tipo]} mb-4`}>
      <span>{iconos[tipo]}</span>
      <span className="flex-1">{mensaje}</span>
      {onClose && <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>}
    </div>
  );
}

// ── Paginación ────────────────────────────────────────────
export function Paginacion({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        disabled={pagina === 0}
        onClick={() => onChange(pagina - 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
      >← Anterior</button>
      <span className="text-sm text-gray-600 px-2">Página {pagina + 1} de {totalPaginas}</span>
      <button
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onChange(pagina + 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
      >Siguiente →</button>
    </div>
  );
}

// ── Barra de nivel (tanque) ───────────────────────────────
export function BarraNivel({ porcentaje }) {
  const color = porcentaje <= 10 ? 'bg-red-500' : porcentaje <= 30 ? 'bg-yellow-400' : 'bg-agua-500';
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className={`h-4 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, porcentaje)}%` }}
      />
    </div>
  );
}
