import { http, HttpResponse } from 'msw';

export const myPageHandlers = [
  http.get('/api/profile/me', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        userNumber: 1,
        name: '테스터',
        ageGroup: '20대',
        gender: 'M',
        preferredTags: ['유럽', '배낭여행'],
        profileUrl: null,
      },
      error: null,
    });
  }),

  http.put('/api/profile/me', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.post('/api/profile/image', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { url: 'https://example.com/profile.jpg' },
      error: null,
    });
  }),

  http.get('/api/profile/image', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { url: null },
      error: null,
    });
  }),

  http.post('/api/auth/verify-password', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),

  http.delete('/api/users/me', () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: null,
      error: null,
    });
  }),
];
