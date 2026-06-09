import React, { useEffect, useState } from 'react';
import { tanqueAPI } from '../services/api';
import { Spinner, Alerta, EmptyState, BarraNivel, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function Tanque() {
  const { esComite } = useAuth();
  const [registros, setRegistros] = useState([]);
  const [ultimo,    setUltimo]    = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [alerta,    setAlerta]    = useState(null);
  const [form,      setForm]      = useState({
    capacidad: 100000, nivelActual: '', fecha: new Date().toISOString().split('T')[0], observacion: ''
  });

  const cargar = async () => {
    setCargando(true);
    try {
      const [listRes, ultRes] = await Promise.allSettled([tanqueAPI.listar(), tanqueAPI.ultimo()]);
      if (listRes.status === 'fulfilled') setRegistros(listRes.value.data.data || []);
      if (ultRes.status  === 'fulfilled') setUltimo(ultRes.value.data.data);
    } catch { }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await tanqueAPI.registrar({ ...form, nivelActual: parseFloat(form.nivelActual), capacidad: parseFloat(form.capacidad) });
      setAlerta({ tipo: 'exito', mensaje: 'Nivel del tanque registrado' });
      setModal(false);
      cargar();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al registrar' });
    } finally { setGuardando(false); }
  };

  const porcentaje = ultimo ? Math.round((ultimo.nivelActual / ultimo.capacidad) * 100) : 0;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nivel del tanque</h1>
          <p className="text-gray-500 text-sm">Registro manual del nivel de agua</p>
        </div>
        {esComite() && (
          <button onClick={() => setModal(true)} className="btn-primary">＋ Registrar nivel</button>
        )}
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* Estado actual */}
      {ultimo && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">🪣 Estado actual del tanque</h2>
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm text-gray-500">Nivel de agua</span>
            <span className={`text-2xl font-bold ${porcentaje <= 10 ? 'text-red-600' : porcentaje <= 30 ? 'text-yellow-600' : 'text-agua-600'}`}>
              {porcentaje}%
            </span>
          </div>
          <BarraNivel porcentaje={porcentaje} />
          {porcentaje <= 10 && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex gap-2">
              🚨 <strong>Nivel crítico:</strong> El tanque está por debajo del 10% de su capacidad.
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Nivel actual', valor: `${ultimo.nivelActual?.toLocaleString()} gal` },
              { label: 'Capacidad total', valor: `${ultimo.capacidad?.toLocaleString()} gal` },
              { label: 'Último registro', valor: ultimo.fecha },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="font-semibold text-gray-700 text-sm mt-0.5">{item.valor}</p>
              </div>
            ))}
          </div>
          {ultimo.observacion && (
            <p className="text-sm text-gray-500 mt-3 italic">"{ultimo.observacion}"</p>
          )}
        </div>
      )}

      {/* Historial */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-700 text-sm">Historial de registros</h2>
        </div>
        {cargando ? <Spinner /> : registros.length === 0 ? <EmptyState mensaje="Sin registros de nivel" icono="🪣" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Nivel (gal)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Capacidad (gal)</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">%</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Observación</th>
                </tr>
              </thead>
              <tbody>
                {[...registros].reverse().map(r => {
                  const pct = Math.round((r.nivelActual / r.capacidad) * 100);
                  return (
                    <tr key={r.idTanque} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{r.fecha}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.nivelActual?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{r.capacidad?.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-bold ${pct <= 10 ? 'text-red-600' : pct <= 30 ? 'text-yellow-600' : 'text-agua-600'}`}>{pct}%</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.observacion || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal titulo="Registrar nivel del tanque" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel actual (galones) *</label>
                <input className="input-field" type="number" min="0" max={form.capacidad} value={form.nivelActual}
                  onChange={e => setForm(f => ({ ...f, nivelActual: e.target.value }))} required placeholder="Ej: 75000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad total (gal)</label>
                <input className="input-field" type="number" value={form.capacidad}
                  onChange={e => setForm(f => ({ ...f, capacidad: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del registro</label>
              <input className="input-field" type="date" value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea className="input-field resize-none" rows={2} value={form.observacion}
                onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} placeholder="Observaciones opcionales..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? 'Guardando...' : 'Registrar nivel'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
