import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

axios.interceptors.response.use((response) => {
  return response;
});

export const customGet = async (url: string) => {
  instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  return instance.get(url);
};

export const customPost = async (url: string, data: any) => {
  instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  return instance.post(url, data);
};

export const customDelete = async (url: string, data: any) => {
  instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  return instance.delete(url, data);
};
