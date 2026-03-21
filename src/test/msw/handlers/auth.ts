import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'test@test.com' && body.password === 'Password123!') {
      return HttpResponse.json({
        resultType: 'SUCCESS',
        success: { userId: '1', accessToken: 'test-access-token' },
        error: null,
      });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('/api/social/login', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userId: '2', accessToken: 'social-access-token' },
      error: null,
    });
  }),

  http.post('/api/users/sign-up', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userNumber: '3', accessToken: 'register-access-token' },
      error: null,
    });
  }),

  http.post('/api/logout', async () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/token/refresh', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userId: '1', accessToken: 'refreshed-token' },
      error: null,
    });
  }),

  http.post('/api/verify/email/send', async () => {
    return HttpResponse.json({
      success: { sessionToken: 'test-session-token' },
    });
  }),

  http.post('/api/verify/email', async () => {
    return HttpResponse.json({
      success: true,
    });
  }),
];
