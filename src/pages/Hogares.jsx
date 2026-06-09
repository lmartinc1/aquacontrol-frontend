import React, { useEffect, useState } from 'react';
import { hogaresAPI } from '../services/api';
import { Spinner, Badge, Modal, Alerta, Paginacion, EmptyState } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const ESTADOS = ['ACTIVO','MOROSO','SUSPENDIDO','INACTIVO'];
const SECTORES = ['Sector A','Sector B','Sector C','Sector D','Sector N','Sector M'];

function FormHogar({ inicial, onGuardar, onCancelar, cargando }) {
  const [form, setForm] = useState(inicial || { apellidoFamilia:'', direccion:'', telefono:'', sector:'', estado:'ACTIVO' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onGuardar(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / apellido de familia *</label>
        <input className="input-field" value={form.apellidoFamilia} onChange={e => set('apellidoFamilia', e.target.value)} placeholder="Ej: García Pérez" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección del servicio *</label>
        <input className="input-field" value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Ej: Sector A, Casa 5" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input className="input-field" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="502 xxxx-xxxx" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
          <select className="input-field" value={form.sector} onChange={e => set('sector', e.target.value)} required>
            <option value="">Seleccionar...</option>
            {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {inicial && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select className="input-field" value={form.estado} onChange={e => set('estado', e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className="btn-secondary">Cancelar</button>
        <button type="submit" disabled={cargando} className="btn-primary">
          {cargando ? 'Guardando...' : inicial ? 'Actualizar hogar' : 'Registrar hogar'}
        </button>
      </div>
    </form>
  );
}

export default function Hogares() {
  const { esComite } = useAuth();
  const [hogares,    setHogares]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [paginas,    setPaginas]    = useState(0);
  const [pagina,     setPagina]     = useState(0);
  const [cargando,   setCargando]   = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'nuevo' | hogar
  const [guardando,  setGuardando]  = useState(false);
  const [alerta,     setAlerta]     = useState(null);
  const [busqueda,   setBusqueda]   = useState('');

  const cargar = async (p = 0) => {
    setCargando(true);
    try {
      const res = await hogaresAPI.listar(p, 10);
      const data = res.data.data;
      setHogares(data.content || []);
      setTotal(data.totalElements || 0);
      setPaginas(data.totalPages || 0);
      setPagina(p);
    } catch { setAlerta({ tipo: 'error', mensaje: 'Error al cargar hogares' }); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(0); }, []);

  const guardar = async (form) => {
    setGuardando(true);
    try {
      if (modal === 'nuevo') {
        await hogaresAPI.crear(form);
        setAlerta({ tipo: 'exito', mensaje: 'Hogar registrado correctamente' });
      } else {
        await hogaresAPI.actualizar(modal.idHogar, form);
        setAlerta({ tipo: 'exito', mensaje: 'Hogar actualizado correctamente' });
      }
      setModal(null);
      cargar(pagina);
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.response?.data?.mensaje || 'Error al guardar hogar' });
    } finally { setGuardando(false); }
  };

  const filtrados = hogares.filter(h =>
    h.apellidoFamilia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    h.sector?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hogares</h1>
          <p className="text-gray-500 text-sm">{total} hogares registrados</p>
        </div>
        {esComite() && (
          <button onClick={() => setModal('nuevo')} className="btn-primary flex items-center gap-2">
            ＋ Registrar hogar
          </button>
        )}
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* Búsqueda */}
      <div className="card">
        <input
          className="input-field"
          placeholder="🔍 Buscar por familia o sector..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden p-0">
        {cargando ? <Spinner /> : filtrados.length === 0 ? <EmptyState mensaje="No se encontraron hogares" icono="🏘️" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Familia</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Dirección</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Sector</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Teléfono</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  {esComite() && <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((h, i) => (
                  <tr key={h.idHogar} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{h.idHogar}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{h.apellidoFamilia}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{h.direccion}</td>
                    <td className="px-4 py-3 text-gray-600">{h.sector || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{h.telefono || '—'}</td>
                    <td className="px-4 py-3"><Badge estado={h.estado} /></td>
                    {esComite() && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setModal(h)}
                          className="text-agua-600 hover:text-agua-800 text-xs font-medium px-2 py-1 rounded hover:bg-agua-50"
                        >✏️ Editar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Paginacion pagina={pagina} totalPaginas={paginas} onChange={p => cargar(p)} />

      {/* Modal nuevo/editar */}
      {modal && (
        <Modal
          titulo={modal === 'nuevo' ? 'Registrar nuevo hogar' : `Editar hogar — ${modal.apellidoFamilia}`}
          onClose={() => setModal(null)}
        >
          <FormHogar
            inicial={modal === 'nuevo' ? null : modal}
            onGuardar={guardar}
            onCancelar={() => setModal(null)}
            cargando={guardando}
          />
        </Modal>
      )}
    </div>
  );
}
