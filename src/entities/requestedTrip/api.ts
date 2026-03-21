import { axiosInstance, handleApiResponse } from '@/shared/api';
import RequestError from '@/context/ReqeustError';
import { getJWTHeader } from '@/utils/user';

export const getRequestedTrips = async (pageParam: number, accessToken: string) => {
  try {
    const response = await axiosInstance.get('/api/my-requested-travels', {
      headers: getJWTHeader(accessToken),
      params: { page: pageParam, size: 10 },
    });
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
};

export const deleteRequestedTrips = async (accessToken: string, travelNumber: number) => {
  try {
    const response = await axiosInstance.delete(
      `/api/my-requested-travels/${travelNumber}/cancel`,
      { headers: getJWTHeader(accessToken) }
    );
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
};
