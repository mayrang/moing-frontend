import { http, HttpResponse } from 'msw';

const mockCommunityItem = {
  communityNumber: 1,
  title: '여행 팁 공유해요',
  content: '유럽 여행 시 유의사항입니다.',
  categoryName: '정보공유',
  userName: '테스터',
  userNumber: 1,
  likeCount: 5,
  commentCount: 2,
  viewCount: 100,
  liked: false,
  createdAt: '2024-01-01T00:00:00',
};

const mockPage = { size: 10, number: 0, totalElements: 1, totalPages: 1 };

export const communityHandlers = [
  http.get('/api/community/posts', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { content: [mockCommunityItem], page: mockPage },
      error: null,
    });
  }),

  http.get('/api/my-communities', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { content: [mockCommunityItem], page: mockPage },
      error: null,
    });
  }),

  http.get('/api/community/posts/:communityNumber', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: mockCommunityItem,
      error: null,
    });
  }),

  http.get('/api/community/:communityNumber/images', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: [],
      error: null,
    });
  }),

  http.post('/api/community/posts', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { communityNumber: 2 },
      error: null,
    });
  }),

  http.put('/api/community/posts/:communityNumber', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.delete('/api/community/posts/:communityNumber', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.post('/api/community/:communityNumber/like', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.delete('/api/community/:communityNumber/like', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.post('/api/community/:communityNumber/images', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.put('/api/community/:communityNumber/images', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),
];
