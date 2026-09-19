import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000',
});

// 🚀 O INTERCEPTOR: Intercepta QUALQUER requisição antes dela sair do front
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@MyGastronomy:token');
    
    if (token && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- SERVIÇOS DE AUTENTICAÇÃO ---
export const authService = {
  login: async (dados: any) => {
    const response = await api.post('/auth/login', dados);
    return response.data; 
  },
  cadastrarUsuario: async (dados: any) => {
    const response = await api.post('/users', dados);
    return response.data;
  }
};

// --- SERVIÇOS DE PRATOS (PLATES) ---
export const plateService = {
  getAll: async () => {
    const response = await api.get('/plates');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/plates/${id}`);
    return response.data;
  }
};

// --- SERVIÇOS DE PEDIDOS (ORDERS) ---
export const orderService = {
  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  createOrder: async (items: { plateId: string; quantity: number }[]) => {
    // Garanta que estamos batendo exatamente em '/orders'
    const response = await api.post('/orders', { items });
    return response.data;
  }
};