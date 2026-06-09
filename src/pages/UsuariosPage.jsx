import React, { useEffect, useState } from 'react';
import { usuariosAPI, hogaresAPI } from '../services/api';
import { Spinner, Alerta, EmptyState, Modal, Badge } from '../components/UI';

export default function Usuarios() {
  const [usuarios,  setUsuarios]  = useState([]);
  const [hogares,   setHogares]   = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [alerta,    setAlerta]    = useState(null);
  const [form,      setForm]      = useState({
    nombre:'', email:'', credenciales:'', rol:'REPRESENTANTE', idHogar:''
  });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));

  const cargar = async () => {
    setCargando(true);
    try {
      const [u, h] = await Promise.allSettled([usuariosAPI.listar(), hogaresAPI.listar(0, 100)]);
      if (u.status==='fulfilled') setUsuarios(u.value.data.data || []);
      if (h.status==='fulfilled') setHogares(h.value.data.data?.content || []);
    } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const payload = { nombre: form.nombre, email: form.email, credenciales: form.credenciales, rol: form.rol };
    if (form.idHogar) payload.hogar = { idHogar: parseInt(form.idHogar) };
    try {
      await usuariosAPI.crear(payload);
      setAlerta({ tipo:'exito', mensaje:'Usuario creado correctamente' });
      setModal(false);
      setForm({ nombre:'', email:'', credenciales:'', rol:'REPRESENTANTE', idHogar:'' });
      cargar();
    } catch(err) {
      setAlerta({ tipo:'error', mensaje: err.response?.data?.mensaje || 'Error al crear usuario' });
    } finally { setGuardando(false); }
  };

  const toggleEstado = async (u) => {
    const nuevoEstado = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await usuariosAPI.cambiarEstado(u.idUsuario, nuevoEstado);
      cargar();
    } catch { setAlerta({ tipo:'error', mensaje:'Error al cambiar estado del usuario' }); }
  };

  const rolLabel = { COMITE:'Comité comunitario', TECNICO:'Técnico', REPRESENTANTE:'Representante' };
  const rolColor = { COMITE:'bg-agua-100 text-agua-700', TECNICO:'bg-yellow-100 text-yellow-700', REPRESENTANTE:'bg-purple-100 text-purple-700' };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de usuarios</h1>
          <p className="text-gray-500 text-sm">{usuarios.length} usuarios registrados en el sistema</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">＋ Crear usuario</button>
      </div>

      {alerta && <Alerta tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      <div className="card overflow-hidden p-0">
        {cargando ? <Spinner /> : usuarios.length === 0 ? (
          <EmptyState mensaje="Sin usuarios registrados" icono="👥" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Correo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.idUsuario} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rolColor[u.rol] || 'bg-gray-100 text-gray-600'}`}>
                        {rolLabel[u.rol] || u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge estado={u.estado} /></td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleEstado(u)}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors
                          ${u.estado==='ACTIVO' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      >
                        {u.estado === 'ACTIVO' ? '🔴 Desactivar' : '🟢 Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal titulo="Crear nuevo usuario" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input className="input-field" value={form.nombre} onChange={e => set('nombre',e.target.value)} required placeholder="Nombre del usuario" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input className="input-field" type="email" value={form.email} onChange={e => set('email',e.target.value)} required placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña inicial *</label>
              <input className="input-field" type="password" value={form.credenciales} onChange={e => set('credenciales',e.target.value)} required placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select className="input-field" value={form.rol} onChange={e => set('rol',e.target.value)}>
                  <option value="COMITE">Comité comunitario</option>
                  <option value="TECNICO">Técnico de mantenimiento</option>
                  <option value="REPRESENTANTE">Representante del hogar</option>
                </select>
              </div>
              {form.rol === 'REPRESENTANTE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hogar asignado</label>
                  <select className="input-field" value={form.idHogar} onChange={e => set('idHogar',e.target.value)}>
                    <option value="">Sin hogar</option>
                    {hogares.map(h => <option key={h.idHogar} value={h.idHogar}>{h.apellidoFamilia}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={guardando} className="btn-primary">{guardando ? 'Creando...' : 'Crear usuario'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
