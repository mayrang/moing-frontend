import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // ── 이메일 로그인 ──────────────────────────────────────
  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'test@test.com' && body.password === 'Password123!') {
      return HttpResponse.json({
        resultType: 'SUCCESS',
        success: { userId: 1, accessToken: 'test-access-token' },
        error: null,
      });
    }
    return HttpResponse.json(
      { resultType: 'FAIL', success: null, error: { reason: '이메일 또는 비밀번호가 올바르지 않습니다.' } },
      { status: 401 }
    );
  }),

  // ── 소셜 로그인 ──────────────────────────────────────
  http.post('/api/social/login', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userId: 2, accessToken: 'social-access-token' },
      error: null,
    });
  }),

  // ── 이메일 회원가입 ──────────────────────────────────
  http.post('/api/users/sign-up', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userNumber: 3, accessToken: 'register-access-token' },
      error: null,
    });
  }),

  // ── 소셜 회원가입 완료 ────────────────────────────────
  http.put('/api/social/google/complete-signup', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userNumber: 4, accessToken: 'google-register-token' },
      error: null,
    });
  }),

  http.put('/api/social/kakao/complete-signup', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userNumber: 5, accessToken: 'kakao-register-token' },
      error: null,
    });
  }),

  // ── 로그아웃 ─────────────────────────────────────────
  http.post('/api/logout', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: true,
      error: null,
    });
  }),

  // ── 토큰 갱신 ────────────────────────────────────────
  http.post('/api/token/refresh', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { userId: 1, accessToken: 'refreshed-token' },
      error: null,
    });
  }),

  // ── 이메일 중복 확인 ──────────────────────────────────
  http.get('/api/users-email', async ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    // duplicate@test.com 은 이미 사용 중으로 처리
    if (email === 'duplicate@test.com') {
      return HttpResponse.json({
        resultType: 'SUCCESS',
        success: false,
        error: null,
      });
    }
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: true,
      error: null,
    });
  }),

  // ── 이메일 인증 코드 발송 ─────────────────────────────
  http.post('/api/verify/email/send', async () => {
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: { sessionToken: 'test-session-token' },
      error: null,
    });
  }),

  // ── 이메일 인증 코드 확인 ─────────────────────────────
  http.post('/api/verify/email', async ({ request }) => {
    const body = (await request.json()) as { verifyCode: string; sessionToken: string };
    // 000000은 잘못된 코드로 처리
    if (body.verifyCode === '000000') {
      return HttpResponse.json(
        { resultType: 'FAIL', success: null, error: { reason: '유효하지 않은 인증번호' } },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {},
      error: null,
    });
  }),

  // ── OAuth 콜백 ────────────────────────────────────────
  http.get('/api/login/oauth/google/callback', async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    // pending-code 이면 신규 유저
    if (code === 'pending-code') {
      return HttpResponse.json({
        resultType: 'SUCCESS',
        success: {
          userStatus: 'PENDING',
          userNumber: 100,
          userName: '구글유저',
          socialLoginId: 'google-social-id',
          userEmail: 'google@test.com',
        },
        error: null,
      });
    }
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        userStatus: 'ABLE',
        socialLoginId: 'google-social-id',
        userEmail: 'google@test.com',
      },
      error: null,
    });
  }),

  http.get('/api/login/oauth/kakao/callback', async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (code === 'pending-code') {
      return HttpResponse.json({
        resultType: 'SUCCESS',
        success: {
          userStatus: 'PENDING',
          userNumber: 200,
          userName: '카카오유저',
          socialLoginId: 'kakao-social-id',
          userEmail: '',
        },
        error: null,
      });
    }
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        userStatus: 'ABLE',
        socialLoginId: 'kakao-social-id',
        userEmail: 'kakao@test.com',
      },
      error: null,
    });
  }),

  http.get('/api/login/oauth/naver/callback', async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (code === 'pending-code') {
      return HttpResponse.json({
        resultType: 'SUCCESS',
        success: {
          userStatus: 'PENDING',
          userNumber: 300,
        },
        error: null,
      });
    }
    return HttpResponse.json({
      resultType: 'SUCCESS',
      success: {
        userStatus: 'ABLE',
        socialLoginId: 'naver-social-id',
        userEmail: 'naver@test.com',
      },
      error: null,
    });
  }),
];
