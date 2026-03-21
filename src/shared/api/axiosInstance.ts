import { getJWTHeader } from '@/utils/user';
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL:
    typeof window === 'undefined'
      ? (process.env.API_BASE_URL ?? '') // 서버 사이드: 백엔드 직접 호출
      : '', // 클라이언트 사이드: Next.js 프록시(/api/*)로 중계
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.defaults.withCredentials = true;

let retryCount = 0;
const MAX_RETRY_COUNT = 5;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 || error.response?.status === 403) {
      retryCount += 1;

      if (retryCount > MAX_RETRY_COUNT) {
        console.error('Max retry attempts reached. Throwing error.');
        throw new Error('Authentication failed after multiple attempts.');
      }

      try {
        const refreshResponse = await axiosInstance.post('/api/token/refresh', {});
        const newAccessToken = refreshResponse.data.success.accessToken;

        return axiosInstance({
          ...originalRequest,
          headers: getJWTHeader(newAccessToken),
        });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);
