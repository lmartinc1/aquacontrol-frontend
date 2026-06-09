import React, { useEffect, useState } from 'react';
import { avisosAPI } from '../services/api';
import { Spinner, Alerta, EmptyState, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const SECTORES = ['Sector A','Sector B','Sector C','Sector D','Sector N','Sector M'];

export default function Avisos() {
  const { esComite } = useAuth();
  const [avisos,    setAvisos]    = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [alerta,    setAlerta]    = useState(null);
  const [form,      setForm]      = useState({ titulo:'', descripcion:'', sector:'', vigencia:'' });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));

  const cargar = async () => {
    setCargando(true);
    try {
      const res = esComite() ? await avisosAPI.listarTodos() : await avisosAPI.listarVigentes();
      setAvisos(res.data.data || []);
    } catch { } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await avisosAPI.registrar(form);
      setAlerta({ tipo:'exito', mensaje:'Aviso publicado correctamente' });
      setModal(false);
      setForm({ titulo:'', descripcion:'', sector:'', vigencia:'' });
      cargar();
    } catch(err) {
      setAlerta({ tipo:'error', mensaje: err.response?.data?.mensaje || 'Error al publicar aviso' });
    } finally { setGuardando(false); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este aviso?')) return;
    try {
      await avisosAPI.eliminar(id);
      setAlerta({ tipo:'exito', mensaje:'Aviso eliminado' });
      cargar();
    } catch { setAlerta({ tipo:'error', mensaje:'Error al eliminar' }); }
  };

  const hoy = new Date().toISOString().split('T')[0];
  const vigentes  = avisos.filter(a => a.vigencia >= hoy);
  const vencidos  = avisos.filter(a => a.vigencia < hoy);

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Avisos comunitarios</h1>
          <p className="text-gray-500 text-sm">Comunicaciones a la comunidad San Miguel</p>
        </div>
        {esComite() && (
          <button onClick={() => setModal(true)} className="btn-primary">＋ Publicar aviso</button>
        )}
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {cargando ? <div className="card"><Spinner /></div> : (
        <>
          {/* Avisos vigentes */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Avisos vigentes ({vigentes.length})
            </h2>
            {vigentes.length === 0 ? (
              <div className="card"><EmptyState mensaje="No hay avisos vigentes" icono="📢" /></div>
            ) : (
              <div className="space-y-3">
                {vigentes.map(a => (
                  <div key={a.idAviso} className="card border-l-4 border-l-agua-500">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <span className="text-2xl">📢</span>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{a.titulo}</span>
                            {a.sector
                              ? <span className="text-xs bg-agua-100 text-agua-700 px-2 py-0.5 rounded-full">{a.sector}</span>
                              : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">General</span>}
                          </div>
                          <p className="text-sm text-gray-600">{a.descripcion}</p>
                          <p className="text-xs text-gray-400 mt-1.5">Vigente hasta: <strong>{a.vigencia}</strong></p>
                        </div>
                      </div>
                      {esComite() && (
                        <button onClick={() => eliminar(a.idAviso)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0" title="Eliminar aviso">🗑️</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avisos vencidos (solo comité) */}
          {esComite() && vencidos.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Avisos vencidos ({vencidos.length})
              </h2>
              <div className="space-y-2">
                {vencidos.map(a => (
                  <div key={a.idAviso} className="card opacity-60 border-l-4 border-l-gray-300">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-600 text-sm">{a.titulo}</p>
                        <p className="text-xs text-gray-400">Venció: {a.vigencia}</p>
                      </div>
                      <button onClick={() => eliminar(a.idAviso)} className="text-red-400 hover:text-red-600 p-1">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modal && (
        <Modal titulo="Publicar aviso comunitario" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título del aviso *</label>
              <input className="input-field" value={form.titulo} onChange={e => set('titulo',e.target.value)} required placeholder="Ej: Corte programado de suministro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea className="input-field resize-none" rows={3} value={form.descripcion} onChange={e => set('descripcion',e.target.value)} required placeholder="Detalle completo del aviso..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector (vacío = general)</label>
                <select className="input-field" value={form.sector} onChange={e => set('sector',e.target.value)}>
                  <option value="">Toda la comunidad</option>
                  {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vigente hasta *</label>
                <input className="input-field" type="date" value={form.vigencia} onChange={e => set('vigencia',e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={guardando} className="btn-primary">{guardando ? 'Publicando...' : 'Publicar aviso'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
