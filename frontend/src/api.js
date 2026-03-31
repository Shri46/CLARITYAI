import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (data) => {
  const response = await api.post('/login', data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/register', data);
  return response.data;
};

export const uploadStatement = async (file) => {
  const formData = new FormData();
  formData.append('statement', file);
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const addManualTransaction = async (data) => {
  const response = await api.post('/manual-transaction', data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Budgets
export const getBudgets = async () => {
  const response = await api.get('/budgets');
  return response.data;
};

export const createBudget = async (data) => {
  const response = await api.post('/budgets', data);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

// Mock function for local testing if DB is down
export const getMockData = () => {
  return {
    statement_id: 1,
    stats: { total: 100, rules: 85, ai: 15, rules_percentage: 85, ai_percentage: 15 },
    transactions: [
      { id: 1, date: '2026-03-21', description: 'SWIGGY', amount: 500, category: 'Food & Dining', source: 'rules' },
      { id: 2, date: '2026-03-20', description: 'AMZN', amount: 1200, category: 'Shopping', source: 'gemini' }
    ]
  };
};

export const getInsights = async () => {
  // Mock function to prevent frontend build failure
  return {
    insights: [
      "Your largest expense category is Food & Dining.",
      "You have an upcoming subscription renewal soon.",
      "Consider cutting back on Shopping this week to stay on budget."
    ]
  };
};
