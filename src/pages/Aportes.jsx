import React, { useEffect, useState } from 'react';
import { aportesAPI, hogaresAPI } from '../services/api';
import { Spinner, Badge, Modal, Alerta, EmptyState } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function FormAporte({ hogares, onGuardar, onCancelar, cargando }) {
  const anioActual = new Date().getFullYear();
  const [form, setForm] = useState({
    idHogar: '', monto: '150', fecha: new Date().toISOString().split('T')[0],
    estado: 'PAGADO', mesCorrespondiente: MESES[new Date().getMonth()],
    anioCorrespondiente: anioActual,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...form,
      monto: parseFloat(form.monto),
      anioCorrespondiente: parseInt(form.anioCorrespondiente),
      hogar: { idHogar: parseInt(form.idHogar) },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hogar *</label>
        <select className="input-field" value={form.idHogar} onChange={e => set('idHogar', e.target.value)} required>
          <option value="">Seleccionar hogar...</option>
          {hogares.map(h => <option key={h.idHogar} value={h.idHogar}>{h.apellidoFamilia} — {h.sector}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes correspondiente *</label>
          <select className="input-field" value={form.mesCorrespondiente} onChange={e => set('mesCorrespondiente', e.target.value)} required>
            {MESES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
          <input className="input-field" type="number" value={form.anioCorrespondiente} onChange={e => set('anioCorrespondiente', e.target.value)} min="2020" max="2030" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto (Q) *</label>
          <input className="input-field" type="number" step="0.01" min="0" value={form.monto} onChange={e => set('monto', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago *</label>
          <input className="input-field" type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estado del pago</label>
        <select className="input-field" value={form.estado} onChange={e => set('estado', e.target.value)}>
          <option value="PAGADO">Pagado</option>
          <option value="PENDIENTE">Pendiente</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={cargando} className="btn-primary">
          {cargando ? 'Registrando...' : 'Registrar aporte'}
        </button>
      </div>
    </form>
  );
}

export default function Aportes() {
  const { esComite } = useAuth();
  const [hogares,    setHogares]    = useState([]);
  const [aportes,    setAportes]    = useState([]);
  const [hogarSel,   setHogarSel]   = useState('');
  const [cargando,   setCargando]   = useState(false);
  const [cargandoH,  setCargandoH]  = useState(true);
  const [modal,      setModal]      = useState(false);
  const [guardando,  setGuardando]  = useState(false);
  const [alerta,     setAlerta]     = useState(null);

  useEffect(() => {
    hogaresAPI.listar(0, 100).then(res => {
      setHogares(res.data.data?.content || []);
    }).finally(() => setCargandoH(false));
  }, []);

  const cargarAportes = async (idHogar) => {
    if (!idHogar) { setAportes([]); return; }
    setCargando(true);
    try {
      const res = await aportesAPI.listarPorHogar(idHogar);
      setAportes(res.data.data?.content || []);
    } catch { setAlerta({ tipo: 'error', mensaje: 'Error al cargar aportes' }); }
    finally { setCargando(false); }
  };

  const handleHogarChange = (id) => {
    setHogarSel(id);
    cargarAportes(id);
  };

  const guardar = async (form) => {
    setGuardando(true);
    try {
      await aportesAPI.registrar(form);
      setAlerta({ tipo: 'exito', mensaje: 'Aporte registrado correctamente' });
      setModal(false);
      if (hogarSel) cargarAportes(hogarSel);
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.response?.data?.mensaje || 'Error al registrar aporte' });
    } finally { setGuardando(false); }
  };

  const hogarSelObj = hogares.find(h => h.idHogar === parseInt(hogarSel));

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Aportes comunitarios</h1>
          <p className="text-gray-500 text-sm">Registro y consulta de aportes mensuales</p>
        </div>
        {esComite() && (
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
            ＋ Registrar aporte
          </button>
        )}
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* Selector de hogar */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-1">Consultar aportes por hogar</label>
        {cargandoH ? <Spinner texto="Cargando hogares..." /> : (
          <select className="input-field" value={hogarSel} onChange={e => handleHogarChange(e.target.value)}>
            <option value="">Seleccionar hogar...</option>
            {hogares.map(h => (
              <option key={h.idHogar} value={h.idHogar}>
                {h.apellidoFamilia} — {h.sector}
              </option>
            ))}
          </select>
        )}
        {hogarSelObj && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-agua-50 rounded-lg border border-agua-100">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="font-semibold text-agua-800 text-sm">{hogarSelObj.apellidoFamilia}</p>
              <p className="text-xs text-gray-500">{hogarSelObj.direccion} · {hogarSelObj.sector}</p>
            </div>
            <div className="ml-auto"><Badge estado={hogarSelObj.estado} /></div>
          </div>
        )}
      </div>

      {/* Lista de aportes */}
      {hogarSel && (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">Historial de aportes</h2>
          </div>
          {cargando ? <Spinner /> : aportes.length === 0 ? (
            <EmptyState mensaje="No hay aportes registrados para este hogar" icono="💰" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Mes / Año</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha de pago</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Monto</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {aportes.map(a => (
                    <tr key={a.idPago} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {a.mesCorrespondiente} {a.anioCorrespondiente}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.fecha}</td>
                      <td className="px-4 py-3 text-right font-semibold text-agua-700">
                        Q {parseFloat(a.monto).toFixed(2)}
                      </td>
                      <td className="px-4 py-3"><Badge estado={a.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal registro */}
      {modal && (
        <Modal titulo="Registrar aporte comunitario" onClose={() => setModal(false)}>
          <FormAporte hogares={hogares} onGuardar={guardar} onCancelar={() => setModal(false)} cargando={guardando} />
        </Modal>
      )}
    </div>
  );
}
