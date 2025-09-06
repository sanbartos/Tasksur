// src/lib/axios.ts
import axios from 'axios';

// Enviar cookies (sesiones) en todas las requests
axios.defaults.withCredentials = true;

// Si usas un backend bajo /api a través del proxy de Vite,
// no necesitas baseURL absoluta. Mantén rutas relativas: /api/...
// axios.defaults.baseURL = '/'; // opcional

export default axios;




