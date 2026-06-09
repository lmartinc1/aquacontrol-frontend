import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api' });

// Interceptor: agrega token automáticamente
API.interceptors.request.use(config => {
  const token = localStorage.getItem('ac_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: manejo global de errores
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ac_token');
      localStorage.removeItem('ac_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Hogares ──────────────────────────────────────────────
export const hogaresAPI = {
  listar:   (page = 0, size = 10) => API.get(`/hogares?page=${page}&size=${size}`),
  obtener:  (id)                  => API.get(`/hogares/${id}`),
  crear:    (data)                => API.post('/hogares', data),
  actualizar:(id, data)           => API.put(`/hogares/${id}`, data),
  cambiarEstado: (id, estado)     => API.patch(`/hogares/${id}/estado?estado=${estado}`),
  eliminar: (id)                  => API.delete(`/hogares/${id}`),
};

// ── Aportes ──────────────────────────────────────────────
export const aportesAPI = {
  registrar:    (data)              => API.post('/aportes', data),
  listarPorHogar:(idHogar, page=0) => API.get(`/aportes/${idHogar}?page=${page}&size=10`),
  historial:    (idHogar, inicio, fin) => API.get(`/aportes/${idHogar}/historial?inicio=${inicio}&fin=${fin}`),
};

// ── Problemas / Incidencias ───────────────────────────────
export const problemasAPI = {
  listar:   (page = 0, size = 10) => API.get(`/problemas?page=${page}&size=${size}`),
  obtener:  (id)                  => API.get(`/problemas/${id}`),
  porHogar: (idHogar)             => API.get(`/problemas/hogar/${idHogar}`),
  registrar:(data)                => API.post('/problemas', data),
  actualizarEstado:(id, estado, observacion) => API.put(`/problemas/${id}/estado`, { estado, observacion }),
};

// ── Mantenimiento ────────────────────────────────────────
export const mantenimientoAPI = {
  listarPorProblema: (idProblema) => API.get(`/mantenimiento/problema/${idProblema}`),
  registrar: (data)               => API.post('/mantenimiento', data),
  actualizarEstado: (id, estado)  => API.patch(`/mantenimiento/${id}/estado`, { estado }),
};

// ── Tanque ───────────────────────────────────────────────
export const tanqueAPI = {
  listar:   ()     => API.get('/tanque'),
  ultimo:   ()     => API.get('/tanque/ultimo'),
  registrar:(data) => API.post('/tanque', data),
};

// ── Distribución ─────────────────────────────────────────
export const distribucionAPI = {
  listarTodos:    ()        => API.get('/distribucion'),
  listarPorSector:(sector)  => API.get(`/distribucion/${sector}`),
  programar:      (data)    => API.post('/distribucion', data),
};

// ── Avisos ───────────────────────────────────────────────
export const avisosAPI = {
  listarVigentes: ()        => API.get('/avisos'),
  listarTodos:    ()        => API.get('/avisos/todos'),
  porSector:      (sector)  => API.get(`/avisos/sector/${sector}`),
  registrar:      (data)    => API.post('/avisos', data),
  eliminar:       (id)      => API.delete(`/avisos/${id}`),
};

// ── Usuarios ─────────────────────────────────────────────
export const usuariosAPI = {
  listar:   ()          => API.get('/usuarios'),
  obtener:  (id)        => API.get(`/usuarios/${id}`),
  crear:    (data)      => API.post('/usuarios', data),
  actualizar:(id, data) => API.put(`/usuarios/${id}`, data),
  cambiarEstado:(id, estado) => API.patch(`/usuarios/${id}/estado`, { estado }),
};

// ── Reportes ─────────────────────────────────────────────
export const reportesAPI = {
  resumen:       ()  => API.get('/reportes/resumen'),
  aportes:       ()  => API.get('/reportes/aportes'),
  mantenimiento: ()  => API.get('/reportes/mantenimiento'),
};

export default API;
