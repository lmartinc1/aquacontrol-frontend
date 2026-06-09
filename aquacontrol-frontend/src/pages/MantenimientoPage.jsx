import React, { useEffect, useState } from 'react';
import { mantenimientoAPI, problemasAPI } from '../services/api';
import { Spinner, Alerta, EmptyState, Modal, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function Mantenimiento() {
  const { esComite, esTecnico } = useAuth();
  const [problemas,    setProblemas]    = useState([]);
  const [modal,        setModal]        = useState(false);
  const [guardando,    setGuardando]    = useState(false);
  const [alerta,       setAlerta]       = useState(null);
  const [probSelec,    setProbSelec]    = useState(null);
  const [mantenimientoList, setMantenimientoList] = useState([]);
  const [cargandoMant, setCargandoMant] = useState(false);
  const [form, setForm] = useState({
    idProblema: '', descripcion: '', tipoActividad: 'TECNICO',
    fecha: new Date().toISOString().split('T')[0]
  });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));

  useEffect(() => {
    problemasAPI.listar(0, 100).then(r => {
      setProblemas(r.data.data?.content || []);
    });
  }, []);

  const verMantenimiento = async (prob) => {
    setProbSelec(prob);
    setCargandoMant(true);
    try {
      const res = await mantenimientoAPI.listarPorProblema(prob.idProblema);
      setMantenimientoList(res.data.data || []);
    } finally { setCargandoMant(false); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await mantenimientoAPI.registrar({
        ...form,
        problema: { idProblema: parseInt(form.idProblema) }
      });
      setAlerta({ tipo:'exito', mensaje:'Mantenimiento registrado correctamente' });
      setModal(false);
      if (probSelec && parseInt(form.idProblema) === probSelec.idProblema) {
        verMantenimiento(probSelec);
      }
    } catch(err) {
      setAlerta({ tipo:'error', mensaje: err.response?.data?.mensaje || 'Error al registrar mantenimiento' });
    } finally { setGuardando(false); }
  };

  const colorEstado = { PENDIENTE:'🔴', EN_PROCESO:'🟡', RESUELTO:'🟢', CANCELADO:'⚫' };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mantenimiento</h1>
          <p className="text-gray-500 text-sm">Registro de actividades de mantenimiento por incidencia</p>
        </div>
        {(esComite() || esTecnico()) && (
          <button onClick={() => setModal(true)} className="btn-primary">＋ Registrar mantenimiento</button>
        )}
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lista de incidencias */}
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">Incidencias activas</h2>
          </div>
          {problemas.filter(p => p.estado !== 'CANCELADO').length === 0 ? (
            <EmptyState mensaje="Sin incidencias activas" icono="✅" />
          ) : (
            <div className="divide-y divide-gray-50">
              {problemas.filter(p => p.estado !== 'CANCELADO').map(p => (
                <button
                  key={p.idProblema}
                  onClick={() => verMantenimiento(p)}
                  className={`w-full text-left px-4 py-3 hover:bg-agua-50 transition-colors
                    ${probSelec?.idProblema === p.idProblema ? 'bg-agua-50 border-l-2 border-l-agua-500' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{colorEstado[p.estado]}</span>
                    <span className="font-medium text-gray-800 text-sm">#{p.idProblema} — {p.tipo || 'Incidencia'}</span>
                    <Badge estado={p.estado} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-5 line-clamp-1">{p.descripcion}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Historial de mantenimiento */}
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700 text-sm">
              {probSelec ? `Mantenimiento — Incidencia #${probSelec.idProblema}` : 'Selecciona una incidencia'}
            </h2>
          </div>
          {!probSelec ? (
            <EmptyState mensaje="Selecciona una incidencia para ver su historial" icono="🔧" />
          ) : cargandoMant ? <Spinner /> : mantenimientoList.length === 0 ? (
            <EmptyState mensaje="Sin registros de mantenimiento para esta incidencia" icono="📋" />
          ) : (
            <div className="divide-y divide-gray-50">
              {mantenimientoList.map(m => (
                <div key={m.idMantenimiento} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-agua-100 text-agua-700 px-1.5 py-0.5 rounded font-medium">
                      {m.tipoActividad === 'TECNICO' ? '🔧 Técnico' : '📋 Administrativo'}
                    </span>
                    <Badge estado={m.estado} />
                    <span className="text-xs text-gray-400 ml-auto">{m.fecha}</span>
                  </div>
                  <p className="text-sm text-gray-600">{m.descripcion || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal titulo="Registrar actividad de mantenimiento" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incidencia asociada *</label>
              <select className="input-field" value={form.idProblema} onChange={e => set('idProblema',e.target.value)} required>
                <option value="">Seleccionar incidencia...</option>
                {problemas.filter(p => p.estado !== 'RESUELTO' && p.estado !== 'CANCELADO').map(p => (
                  <option key={p.idProblema} value={p.idProblema}>
                    #{p.idProblema} — {p.tipo} ({p.estado.replace('_',' ')})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de actividad</label>
                <select className="input-field" value={form.tipoActividad} onChange={e => set('tipoActividad',e.target.value)}>
                  <option value="TECNICO">Técnico — mantenimiento físico</option>
                  <option value="ADMINISTRATIVO">Administrativo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input className="input-field" type="date" value={form.fecha} onChange={e => set('fecha',e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la actividad *</label>
              <textarea className="input-field resize-none" rows={3} value={form.descripcion}
                onChange={e => set('descripcion',e.target.value)} required
                placeholder="Describir las acciones realizadas o el trabajo ejecutado..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? 'Guardando...' : 'Registrar mantenimiento'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
