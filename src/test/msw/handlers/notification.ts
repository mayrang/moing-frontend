import { http, HttpResponse } from 'msw';

export const notificationHandlers = [
  http.get('/api/notifications', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        notifications: [
          {
            notificationNumber: 1,
            content: '여행 신청이 수락되었습니다.',
            relatedType: 'travel',
            relatedNumber: 1,
            isRead: false,
            createdAt: '2024-01-01T00:00:00',
          },
        ],
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
      error: null,
    });
  }),
];
