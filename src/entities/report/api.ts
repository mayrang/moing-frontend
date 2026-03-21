import { axiosInstance, handleApiResponse } from '@/shared/api';
import RequestError from '@/context/ReqeustError';
import { getJWTHeader } from '@/utils/user';
import { PostReport } from './model';

export const postReport = async (data: PostReport, accessToken: string) => {
  try {
    const response = await axiosInstance.post('/api/member/block', data, {
      headers: getJWTHeader(accessToken),
    });
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
};

export const getBlock = async (token: string) => {
  try {
    const response = await axiosInstance.get(`/api/member/block/my/detail?token=${token}`);
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
};
