import { http, HttpResponse } from 'msw';

const mockPage = { size: 10, number: 0, totalElements: 1, totalPages: 1 };

export const userProfileHandlers = [
  http.get('/api/users/:userNumber/profile', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        userNumber: 2,
        name: '상대방',
        ageGroup: '20대',
        gender: 'M',
        profileUrl: null,
      },
      error: null,
    });
  }),

  http.get('/api/users/:userNumber/created-travels', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        content: [{ travelNumber: 1, title: '상대방이 만든 여행' }],
        page: mockPage,
      },
      error: null,
    });
  }),

  http.get('/api/users/:userNumber/applied-travels', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        content: [{ travelNumber: 2, title: '상대방이 참가한 여행' }],
        page: mockPage,
      },
      error: null,
    });
  }),
];
