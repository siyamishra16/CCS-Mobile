const API_BASE_URL = 'https://ccs-mobile.onrender.com/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify`,
  RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  CHECK_USER: `${API_BASE_URL}/auth/check-user`,
};

export default API_BASE_URL;