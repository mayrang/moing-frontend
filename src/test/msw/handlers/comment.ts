import { http, HttpResponse } from 'msw';

const mockComment = {
  commentNumber: 1,
  content: '좋은 여행이에요!',
  userNumber: 1,
  userName: '테스터',
  likeCount: 0,
  liked: false,
  createdAt: '2024-01-01T00:00:00',
};

export const commentHandlers = [
  http.get('/api/:relatedType/:relatedNumber/comments', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        comments: [mockComment],
        page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
      },
      error: null,
    });
  }),

  http.post('/api/:relatedType/:relatedNumber/comments', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { commentNumber: 2 },
      error: null,
    });
  }),

  http.put('/api/comments/:commentNumber', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.delete('/api/comments/:commentNumber', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.post('/api/comment/:commentNumber/like', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),
];
