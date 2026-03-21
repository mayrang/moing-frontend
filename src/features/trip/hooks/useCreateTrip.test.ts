import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useCreateTrip } from './useCreateTrip';
import type { CreateTripReqData } from '@/entities/trip';

const mockTravelData: CreateTripReqData = {
  locationName: '프랑스',
  startDate: '2024-06-01',
  endDate: '2024-06-10',
  title: '유럽 배낭여행',
  details: '즐거운 여행',
  maxPerson: 4,
  genderType: 'ANY',
  periodType: 'WEEK',
  tags: ['유럽'],
  plans: [],
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: any }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateTrip', () => {
  it('초기 상태에서 isCreatedSuccess는 false다', () => {
    const { result } = renderHook(
      () => useCreateTrip(mockTravelData, 'test-token'),
      { wrapper: createWrapper() }
    );
    expect(result.current.isCreatedSuccess).toBe(false);
  });

  it('createTripMutate 함수를 반환한다', () => {
    const { result } = renderHook(
      () => useCreateTrip(mockTravelData, 'test-token'),
      { wrapper: createWrapper() }
    );
    expect(typeof result.current.createTripMutate).toBe('function');
  });

  it('뮤테이션 성공 시 isCreatedSuccess가 true가 된다', async () => {
    const { result } = renderHook(
      () => useCreateTrip(mockTravelData, 'test-token'),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.createTripMutate();
    });

    await waitFor(() => expect(result.current.isCreatedSuccess).toBe(true));
  });
});
