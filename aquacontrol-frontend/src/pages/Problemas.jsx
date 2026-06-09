import React, { useEffect, useState } from 'react';
import { problemasAPI, hogaresAPI } from '../services/api';
import { Spinner, Badge, Modal, Alerta, EmptyState, Paginacion } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const TIPOS = ['Cañería rota','Cañería tapada','Fuga de agua','Falla en válvula','Sin suministro','Baja presión','Otro'];

function FormProblema({ hogares, onGuardar, onCancelar, cargando }) {
  const [form, setForm] = useState({
    idHogar: '', descripcion: '', tipo: TIPOS[0],
    fecha: new Date().toISOString().split('T')[0],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onGuardar({ ...form, hogar: { idHogar: parseInt(form.idHogar) } }); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hogar afectado *</label>
        <select className="input-field" value={form.idHogar} onChange={e => set('idHogar', e.target.value)} required>
          <option value="">Seleccionar hogar...</option>
          {hogares.map(h => <option key={h.idHogar} value={h.idHogar}>{h.apellidoFamilia} — {h.sector}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de incidencia *</label>
        <select className="input-field" value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del problema *</label>
        <textarea
          className="input-field resize-none"
          rows={3}
          value={form.descripcion}
          onChange={e => set('descripcion', e.target.value)}
          placeholder="Describa el problema con detalle..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de reporte</label>
        <input className="input-field" type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={cargando} className="btn-primary">
          {cargando ? 'Registrando...' : 'Registrar incidencia'}
        </button>
      </div>
    </form>
  );
}

function ModalActualizarEstado({ problema, onGuardar, onCancelar, cargando }) {
  const [estado,      setEstado]      = useState('EN_PROCESO');
  const [observacion, setObservacion] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onGuardar(problema.idProblema, estado, observacion); }} className="space-y-4">
      <div className="p-3 bg-gray-50 rounded-lg text-sm">
        <p className="font-medium text-gray-700">{problema.tipo}</p>
        <p className="text-gray-500 text-xs mt-1">{problema.descripcion}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo estado *</label>
        <select className="input-field" value={estado} onChange={e => setEstado(e.target.value)} required>
          <option value="EN_PROCESO">En proceso</option>
          <option value="RESUELTO">Resuelto</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones de seguimiento</label>
        <textarea className="input-field resize-none" rows={3} value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Describa las acciones realizadas..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={cargando} className="btn-primary">
          {cargando ? 'Actualizando...' : 'Actualizar estado'}
        </button>
      </div>
    </form>
  );
}

export default function Problemas() {
  const { esComite, esTecnico } = useAuth();
  const [problemas,  setProblemas]  = useState([]);
  const [hogares,    setHogares]    = useState([]);
  const [pagina,     setPagina]     = useState(0);
  const [totalPag,   setTotalPag]   = useState(0);
  const [cargando,   setCargando]   = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEdit,  setModalEdit]  = useState(null);
  const [guardando,  setGuardando]  = useState(false);
  const [alerta,     setAlerta]     = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  const cargar = async (p = 0) => {
    setCargando(true);
    try {
      const res = await problemasAPI.listar(p, 10);
      const data = res.data.data;
      setProblemas(data.content || []);
      setTotalPag(data.totalPages || 0);
      setPagina(p);
    } catch { setAlerta({ tipo: 'error', mensaje: 'Error al cargar incidencias' }); }
    finally { setCargando(false); }
  };

  useEffect(() => {
    cargar(0);
    hogaresAPI.listar(0, 100).then(r => setHogares(r.data.data?.content || []));
  }, []);

  const guardarNuevo = async (form) => {
    setGuardando(true);
    try {
      await problemasAPI.registrar(form);
      setAlerta({ tipo: 'exito', mensaje: 'Incidencia registrada correctamente' });
      setModalNuevo(false);
      cargar(0);
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.response?.data?.mensaje || 'Error al registrar' });
    } finally { setGuardando(false); }
  };

  const actualizarEstado = async (id, estado, observacion) => {
    setGuardando(true);
    try {
      await problemasAPI.actualizarEstado(id, estado, observacion);
      setAlerta({ tipo: 'exito', mensaje: 'Estado actualizado correctamente' });
      setModalEdit(null);
      cargar(pagina);
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.response?.data?.mensaje || 'Error al actualizar' });
    } finally { setGuardando(false); }
  };

  const filtrados = filtroEstado ? problemas.filter(p => p.estado === filtroEstado) : problemas;

  const colorEstado = { PENDIENTE: '🔴', EN_PROCESO: '🟡', RESUELTO: '🟢', CANCELADO: '⚫' };

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incidencias</h1>
          <p className="text-gray-500 text-sm">Registro y seguimiento de problemas del servicio</p>
        </div>
        {(esComite() || esTecnico()) && (
          <button onClick={() => setModalNuevo(true)} className="btn-primary flex items-center gap-2">
            ＋ Registrar incidencia
          </button>
        )}
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* Filtros */}
      <div className="card flex flex-wrap gap-2">
        {['', 'PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CANCELADO'].map(e => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filtroEstado === e ? 'bg-agua-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {e === '' ? 'Todos' : `${colorEstado[e]} ${e.replace('_', ' ')}`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {cargando ? <div className="card"><Spinner /></div> : filtrados.length === 0 ? (
          <div className="card"><EmptyState mensaje="No hay incidencias registradas" icono="⚠️" /></div>
        ) : filtrados.map(p => (
          <div key={p.idProblema} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 flex-1 min-w-0">
                <span className="text-2xl mt-0.5">{colorEstado[p.estado]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{p.tipo || 'Incidencia'}</span>
                    <Badge estado={p.estado} />
                    <span className="text-xs text-gray-400">#{p.idProblema}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.descripcion}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span>📅 {p.fecha}</span>
                    {p.hogar && <span>🏠 Hogar #{p.hogar.idHogar}</span>}
                  </div>
                </div>
              </div>
              {(esComite() || esTecnico()) && p.estado !== 'RESUELTO' && p.estado !== 'CANCELADO' && (
                <button
                  onClick={() => setModalEdit(p)}
                  className="btn-secondary text-xs whitespace-nowrap"
                >
                  Actualizar estado
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Paginacion pagina={pagina} totalPaginas={totalPag} onChange={cargar} />

      {modalNuevo && (
        <Modal titulo="Registrar incidencia" onClose={() => setModalNuevo(false)}>
          <FormProblema hogares={hogares} onGuardar={guardarNuevo} onCancelar={() => setModalNuevo(false)} cargando={guardando} />
        </Modal>
      )}

      {modalEdit && (
        <Modal titulo="Actualizar estado de incidencia" onClose={() => setModalEdit(null)}>
          <ModalActualizarEstado problema={modalEdit} onGuardar={actualizarEstado} onCancelar={() => setModalEdit(null)} cargando={guardando} />
        </Modal>
      )}
    </div>
  );
}
