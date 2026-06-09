import React, { useEffect, useState } from 'react';
import { distribucionAPI, tanqueAPI } from '../services/api';
import { Spinner, Alerta, EmptyState, Modal, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const SECTORES = ['Sector A','Sector B','Sector C','Sector D','Sector N','Sector M'];

export default function Distribucion() {
  const { esComite } = useAuth();
  const [distribuciones, setDistribuciones] = useState([]);
  const [tanques,   setTanques]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [alerta,    setAlerta]    = useState(null);
  const [form,      setForm]      = useState({ sector:'', dia:'', hora:'', observacion:'', idTanque:'' });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));

  const cargar = async () => {
    setCargando(true);
    try {
      const [d, t] = await Promise.allSettled([distribucionAPI.listarTodos(), tanqueAPI.listar()]);
      if (d.status==='fulfilled') setDistribuciones(d.value.data.data || []);
      if (t.status==='fulfilled') setTanques(t.value.data.data || []);
    } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await distribucionAPI.programar({ ...form, tanque: { idTanque: parseInt(form.idTanque) } });
      setAlerta({ tipo:'exito', mensaje:'Distribución programada correctamente' });
      setModal(false);
      cargar();
    } catch(err) {
      setAlerta({ tipo:'error', mensaje: err.response?.data?.mensaje || 'Error al programar distribución' });
    } finally { setGuardando(false); }
  };

  const agrupado = SECTORES.map(s => ({
    sector: s, items: distribuciones.filter(d => d.sector === s)
  })).filter(g => g.items.length > 0);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Distribución del agua</h1>
          <p className="text-gray-500 text-sm">Programación de turnos por sector · Comunidad San Miguel</p>
        </div>
        {esComite() && (
          <button onClick={() => setModal(true)} className="btn-primary">＋ Programar turno</button>
        )}
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {cargando ? <div className="card"><Spinner /></div> :
       distribuciones.length === 0 ? <div className="card"><EmptyState mensaje="No hay distribuciones programadas" icono="🚿" /></div> : (
        <div className="space-y-4">
          {agrupado.length > 0 ? agrupado.map(g => (
            <div key={g.sector} className="card overflow-hidden p-0">
              <div className="px-4 py-3 bg-agua-700 text-white font-semibold text-sm flex items-center gap-2">
                🚿 {g.sector} <span className="text-agua-200 font-normal text-xs">({g.items.length} turno{g.items.length!==1?'s':''})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">Día</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">Hora</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">Estado</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-600">Observación</th>
                  </tr></thead>
                  <tbody>
                    {g.items.map(d => (
                      <tr key={d.idDistribucion} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{d.dia}</td>
                        <td className="px-4 py-2.5 text-gray-600">{d.hora}</td>
                        <td className="px-4 py-2.5"><Badge estado={d.estado} /></td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{d.observacion || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )) : <div className="card"><EmptyState mensaje="Sin programación por sector" icono="🚿" /></div>}
        </div>
      )}

      {modal && (
        <Modal titulo="Programar distribución del agua" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                <select className="input-field" value={form.sector} onChange={e => set('sector',e.target.value)} required>
                  <option value="">Seleccionar...</option>
                  {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanque *</label>
                <select className="input-field" value={form.idTanque} onChange={e => set('idTanque',e.target.value)} required>
                  <option value="">Seleccionar tanque...</option>
                  {tanques.map(t => <option key={t.idTanque} value={t.idTanque}>Tanque #{t.idTanque} — {t.fecha}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día *</label>
                <input className="input-field" type="date" value={form.dia} onChange={e => set('dia',e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                <input className="input-field" type="time" value={form.hora} onChange={e => set('hora',e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea className="input-field resize-none" rows={2} value={form.observacion} onChange={e => set('observacion',e.target.value)} placeholder="Observaciones opcionales..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={guardando} className="btn-primary">{guardando ? 'Guardando...' : 'Programar turno'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
