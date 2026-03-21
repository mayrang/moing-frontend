import { axiosInstance, handleApiResponse } from '@/shared/api';
import RequestError from '@/context/ReqeustError';
import { getJWTHeader } from '@/utils/user';
import { Filters } from './model';

export async function getSearch(
  pageParams: number,
  keyword: string,
  filters: Filters,
  accessToken: string | null
) {
  const { tags, period, person, gender, location, sorting } = filters;
  try {
    const response = await axiosInstance.get('/api/travels/search', {
      params: {
        keyword,
        page: pageParams,
        sorting,
        tags: tags.join(','),
        period: period.join(','),
        person: person.join(','),
        gender: gender.join(','),
        location: location.join(','),
      },
      ...(accessToken && { headers: getJWTHeader(accessToken) }),
    });
    return handleApiResponse(response);
  } catch (err: any) {
    throw new RequestError(err);
  }
}

export async function getSearchRelation(keyword: string, accessToken: string | null) {
  try {
    const response = await axiosInstance.get('/api/autocomplete', {
      params: { location: keyword },
      ...(accessToken && { headers: getJWTHeader(accessToken) }),
    });
    return handleApiResponse(response) as { suggestions: string[] };
  } catch (err: any) {
    throw new RequestError(err);
  }
}
