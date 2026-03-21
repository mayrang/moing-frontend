import { http, HttpResponse } from 'msw';

const mockBookmarkContent = {
  travelNumber: 1,
  title: '유럽 배낭여행',
  userNumber: 1,
  userName: '테스터',
  tags: ['유럽'],
  nowPerson: 2,
  maxPerson: 4,
  createdAt: '2024-01-01T00:00:00',
  registerDue: '2024-12-31',
  location: '프랑스',
  bookmarked: true,
};

export const bookmarkHandlers = [
  http.get('/api/bookmarks', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        content: [mockBookmarkContent],
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
      error: null,
    });
  }),

  http.post('/api/bookmarks', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.delete('/api/bookmarks/:travelNumber', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),
];
