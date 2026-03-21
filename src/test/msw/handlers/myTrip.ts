import { http, HttpResponse } from 'msw';

const mockMyTripContent = {
  travelNumber: 1,
  title: '내가 만든 여행',
  userNumber: 1,
  userName: '테스터',
  tags: ['국내'],
  nowPerson: 1,
  maxPerson: 4,
  createdAt: '2024-01-01T00:00:00',
  registerDue: '2024-12-31',
  location: '서울',
  bookmarked: false,
};

const mockPage = { size: 10, number: 0, totalElements: 1, totalPages: 1 };

export const myTripHandlers = [
  http.get('/api/my-travels', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { content: [mockMyTripContent], page: mockPage },
      error: null,
    });
  }),

  http.get('/api/my-applied-travels', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        content: [{ ...mockMyTripContent, title: '참가한 여행' }],
        page: mockPage,
      },
      error: null,
    });
  }),

  http.delete('/api/my-applied-travels/:travelNumber/cancel', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.get('/api/my-requested-travels', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        content: [{ ...mockMyTripContent, title: '신청한 여행' }],
        page: mockPage,
      },
      error: null,
    });
  }),

  http.delete('/api/my-requested-travels/:travelNumber/cancel', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),
];
