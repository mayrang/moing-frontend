import { axiosInstance, handleApiResponse } from '@/shared/api';
import RequestError from '@/context/ReqeustError';
import { getJWTHeader } from '@/utils/user';
import { ICommentPost } from './model';

export async function getComments(
  relatedType: 'travel' | 'community',
  relatedNumber: number,
  accessToken: string | null,
  page: number
) {
  try {
    const result = await axiosInstance.get(`/api/${relatedType}/${relatedNumber}/comments`, {
      ...(accessToken && { headers: getJWTHeader(accessToken) }),
      params: { page },
    });
    return handleApiResponse(result);
  } catch (err: any) {
    throw new RequestError(err);
  }
}

export async function postComment(
  data: ICommentPost,
  relatedType: 'travel' | 'community',
  relatedNumber: number,
  accessToken: string | null
) {
  try {
    if (!accessToken) throw new Error('로그인을 해주세요.');
    return axiosInstance.post(`/api/${relatedType}/${relatedNumber}/comments`, data, {
      headers: getJWTHeader(accessToken),
    });
  } catch (err: any) {
    throw new RequestError(err);
  }
}

export async function updateComment(
  data: { content: string; commentNumber: number },
  commentNumber: number,
  accessToken: string | null
) {
  try {
    if (!accessToken) throw new Error('로그인을 해주세요.');
    const response = await axiosInstance.put(
      `/api/comments/${commentNumber}`,
      { content: data.content },
      { headers: getJWTHeader(accessToken) }
    );
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
}

export async function deleteComment(commentNumber: number, accessToken: string | null) {
  try {
    if (!accessToken) throw new Error('로그인을 해주세요.');
    const response = await axiosInstance.delete(`/api/comments/${commentNumber}`, {
      headers: getJWTHeader(accessToken),
    });
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
}

export async function likeComment(commentNumber: number, accessToken: string | null) {
  try {
    if (!accessToken) throw new Error('로그인을 해주세요.');
    const response = await axiosInstance.post(
      `/api/comment/${commentNumber}/like`,
      {},
      { headers: getJWTHeader(accessToken) }
    );
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
}

export async function unlikeComment(commentNumber: number, accessToken: string | null) {
  try {
    if (!accessToken) throw new Error('로그인을 해주세요.');
    const response = await axiosInstance.post(
      `/api/comment/${commentNumber}/like`,
      {},
      { headers: getJWTHeader(accessToken) }
    );
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
}
