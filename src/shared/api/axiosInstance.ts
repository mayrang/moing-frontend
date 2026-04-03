import { getJWTHeader } from '@/utils/user';
import { logger } from '@/shared/lib/logger';
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

    // 로그인 / 토큰 갱신 엔드포인트의 401은 재시도 불필요
    const isLoginEndpoint = originalRequest?.url?.includes('/api/login');
    const isRefreshEndpoint = originalRequest?.url?.includes('/api/token/refresh');
    // HTML 응답(Vercel Deployment Protection 등)은 리프레시 루프 진입 금지
    const isHtmlResponse = typeof error.response?.data === 'string' && error.response.data.includes('<!doctype html');
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !isLoginEndpoint &&
      !isRefreshEndpoint &&
      !isHtmlResponse
    ) {
      retryCount += 1;

      if (retryCount > MAX_RETRY_COUNT) {
        retryCount = 0;
        const authError = new Error('Authentication failed after multiple attempts.');
        logger.error('Auth retry exhausted', authError, { url: originalRequest?.url });
        throw authError;
      }

      try {
        logger.breadcrumb('token refresh attempt', { url: originalRequest?.url, retryCount });
        const refreshResponse = await axiosInstance.post('/api/token/refresh', {});
        const newAccessToken = refreshResponse.data.success.accessToken;
        retryCount = 0;
        return axiosInstance({
          ...originalRequest,
          headers: getJWTHeader(newAccessToken),
        });
      } catch (refreshError) {
        retryCount = 0;
        logger.error('Token refresh failed', refreshError instanceof Error ? refreshError : new Error(String(refreshError)));
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);
