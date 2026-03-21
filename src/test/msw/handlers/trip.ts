import { http, HttpResponse } from 'msw';

const mockTripContent = {
  travelNumber: 1,
  title: '유럽 배낭여행',
  userNumber: 1,
  userName: '테스터',
  tags: ['유럽', '배낭여행'],
  nowPerson: 2,
  maxPerson: 4,
  createdAt: '2024-01-01T00:00:00',
  registerDue: '2024-12-31',
  location: '프랑스',
  bookmarked: false,
};

const mockPage = {
  size: 10,
  number: 0,
  totalElements: 1,
  totalPages: 1,
};

export const tripHandlers = [
  http.post('/api/travel', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { travelNumber: 1 },
      error: null,
    });
  }),

  http.get('/api/travels/recent', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        content: [mockTripContent],
        page: mockPage,
      },
      error: null,
    });
  }),

  http.get('/api/travels/recommend', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        content: [mockTripContent],
        page: mockPage,
      },
      error: null,
    });
  }),

  http.get('/api/profile/me', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        userNumber: 1,
        name: '테스터',
        profileImage: null,
      },
      error: null,
    });
  }),
];
