const API_URL = 'http://localhost:5001/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      return data;
    },
    signup: async (email, password, name) => {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) throw new Error('Signup failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getProfile: async () => {
      const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  },
  products: {
    list: async () => {
      const res = await fetch(`${API_URL}/products`, { headers: getHeaders() });
      return res.json();
    },
    create: async (product) => {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(product),
      });
      return res.json();
    },
  },
  warehouses: {
    list: async () => {
      const res = await fetch(`${API_URL}/warehouses`, { headers: getHeaders() });
      return res.json();
    },
  },
  locations: {
    list: async () => {
      const res = await fetch(`${API_URL}/locations`, { headers: getHeaders() });
      return res.json();
    },
  },
  receipts: {
    list: async () => {
      const res = await fetch(`${API_URL}/receipts`, { headers: getHeaders() });
      return res.json();
    },
    create: async (receipt) => {
      const res = await fetch(`${API_URL}/receipts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(receipt),
      });
      return res.json();
    },
    validate: async (id) => {
      const res = await fetch(`${API_URL}/receipts/${id}/validate`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return res.json();
    },
  },
  deliveries: {
    list: async () => {
      const res = await fetch(`${API_URL}/deliveries`, { headers: getHeaders() });
      return res.json();
    },
    create: async (delivery) => {
      const res = await fetch(`${API_URL}/deliveries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(delivery),
      });
      return res.json();
    },
    validate: async (id) => {
      const res = await fetch(`${API_URL}/deliveries/${id}/validate`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return res.json();
    },
  },
  transfers: {
    list: async () => {
      const res = await fetch(`${API_URL}/transfers`, { headers: getHeaders() });
      return res.json();
    },
    create: async (transfer) => {
      const res = await fetch(`${API_URL}/transfers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(transfer),
      });
      return res.json();
    },
  },
  adjustments: {
    create: async (adjustment) => {
      const res = await fetch(`${API_URL}/adjustments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(adjustment),
      });
      return res.json();
    },
  },
  stock: {
    list: async () => {
      const res = await fetch(`${API_URL}/stock`, { headers: getHeaders() });
      return res.json();
    },
  },
  moveHistory: {
    list: async () => {
      const res = await fetch(`${API_URL}/move-history`, { headers: getHeaders() });
      return res.json();
    },
  },
  dashboard: {
    kpis: async () => {
      const res = await fetch(`${API_URL}/dashboard/kpis`, { headers: getHeaders() });
      return res.json();
    },
  },
};
