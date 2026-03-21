import { http, HttpResponse } from 'msw';

export const enrollmentHandlers = [
  http.post('/api/enrollment', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { enrollmentNumber: 10 },
      error: null,
    });
  }),

  http.delete('/api/enrollment/:enrollmentNumber', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.get('/api/travel/:travelNumber/enrollments', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        enrollments: [
          { enrollmentNumber: 1, userName: '신청자1', ageGroup: '20대', status: 'PENDING' },
        ],
      },
      error: null,
    });
  }),

  http.get('/api/travel/:travelNumber/enrollments/last-viewed', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { lastViewedAt: '2024-01-01T00:00:00' },
      error: null,
    });
  }),

  http.put('/api/travel/:travelNumber/enrollments/last-viewed', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.put('/api/enrollment/:enrollmentNumber/rejection', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.put('/api/enrollment/:enrollmentNumber/acceptance', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),
];
