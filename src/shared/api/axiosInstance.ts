import { getJWTHeader } from '@/utils/user';
import axios from 'axios';

function getBaseURL(): string {
  if (typeof window !== 'undefined') return ''; // 클라이언트: 상대경로 사용
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL; // 명시적 백엔드 URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel 배포
  return `http://localhost:${process.env.PORT ?? 3000}`; // 로컬 개발
}

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
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

    // 로그인 엔드포인트의 401은 "잘못된 자격증명" — 토큰 갱신 불필요
    const isLoginEndpoint = originalRequest?.url?.includes('/api/login');
    // HTML 응답(Vercel Deployment Protection 등)은 리프레시 루프 진입 금지
    const isHtmlResponse = typeof error.response?.data === 'string' && error.response.data.includes('<!doctype html');
    if ((error.response?.status === 401 || error.response?.status === 403) && !isLoginEndpoint && !isHtmlResponse) {
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
