import { AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  resultType: string;
  error?: {
    errorType?: string;
    reason?: string;
    title?: string;
  } | null;
  success: T | null;
}

export const handleApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T | null>>
): T | null => {
  if (response.data.resultType !== 'SUCCESS') {
    throw new Error('API call failed: Unexpected resultType');
  }

  if (response.data?.error != null) {
    throw new Error(response.data.error?.reason || 'Unknown error occurred');
  }

  return response.data.success;
};
