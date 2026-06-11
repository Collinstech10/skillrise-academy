import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('skillrise_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('skillrise_token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: RegisterData) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { oldPassword, newPassword }),
};

// Users
export const userApi = {
  updateProfile: (data: Partial<{ fullname: string; phone: string; avatar_url: string }>) =>
    api.put('/users/profile', data),
  uploadAvatar: (file: FormData) => api.post('/users/avatar', file, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDashboard: () => api.get('/users/dashboard'),
  getReferrals: () => api.get('/users/referrals'),
};

// Courses
export const courseApi = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  purchase: (courseId: string, paymentRef: string) =>
    api.post('/courses/purchase', { courseId, paymentRef }),
  getMyCourses: () => api.get('/courses/my-courses'),
};

// Payments
export const paymentApi = {
  verifyMembership: (reference: string) =>
    api.post('/payments/verify-membership', { reference }),
  verifyCourse: (reference: string, courseId: string) =>
    api.post('/payments/verify-course', { reference, courseId }),
  getHistory: () => api.get('/payments/history'),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { page?: number; search?: string; status?: string }) =>
    api.get('/admin/users', { params }),
  updateUserStatus: (userId: string, status: string) =>
    api.put(`/admin/users/${userId}/status`, { status }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data: FormData) => api.post('/admin/courses', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCourse: (id: string, data: FormData) => api.put(`/admin/courses/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`),
  getPayments: () => api.get('/admin/payments'),
  verifyPayment: (id: string) => api.put(`/admin/payments/${id}/verify`),
  getReferrals: () => api.get('/admin/referrals'),
  createAnnouncement: (data: { title: string; message: string }) =>
    api.post('/admin/announcements', data),
  getAnnouncements: () => api.get('/admin/announcements'),
};

export interface RegisterData {
  fullname: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  referral_code?: string;
}

export default api;
