import { axiosInstance, handleApiResponse } from '@/shared/api';
import RequestError from '@/context/ReqeustError';
import { getJWTHeader } from '@/utils/user';
import { CreateTripReqData } from './model';

// 여행 생성
export const createTrip = async (travelData: CreateTripReqData, accessToken: string) => {
  try {
    const response = await axiosInstance.post('/api/travel', travelData, {
      headers: getJWTHeader(accessToken),
    });
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
};

// 여행 일정 조회
export const getPlans = async (travelNumber: number, pageParams: number | null) => {
  try {
    const result = await axiosInstance.get(`/api/travel/${travelNumber}/plans`, {
      params: { cursor: pageParams, size: 5 },
    });
    return handleApiResponse(result);
  } catch (err: any) {
    throw new RequestError(err);
  }
};

// 홈 - 최근 여행 목록
export const getAvailableTrips = async (pageParams: number, accessToken: string | null) => {
  try {
    const response = await axiosInstance.get('/api/travels/recent', {
      params: { page: pageParams, size: 10 },
      ...(accessToken && { headers: getJWTHeader(accessToken) }),
    });
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
};

// 홈 - 추천 여행 목록
export const getRecommendationTrips = async (pageParams: number, accessToken: string | null) => {
  try {
    const response = await axiosInstance.get('/api/travels/recommend', {
      params: { page: pageParams, size: 10 },
      ...(accessToken && { headers: getJWTHeader(accessToken) }),
    });
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
};

// 홈 - 내 프로필 조회 (레거시, myPage에서 중복 존재)
export const getHomeUserProfile = async (accessToken: string) => {
  const response = await axiosInstance.get(`/api/profile/me?userNumber=${accessToken}`);
  return handleApiResponse(response);
};
