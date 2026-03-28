import { Router, Request, Response } from 'express';
import db, { User, AgeGroup, Gender } from '../db/store';

const router = Router();

// ── 공통 응답 헬퍼 ────────────────────────────────────────────────────────

const ok = (res: Response, success: unknown) =>
  res.json({ resultType: 'SUCCESS', success, error: null });

const fail = (res: Response, reason: string, status = 400) =>
  res.status(status).json({ resultType: 'FAIL', success: null, error: { reason } });

const getBearerToken = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
};

// ── 이메일 로그인 ─────────────────────────────────────────────────────────
// POST /api/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email);

  if (!user || user.password !== password) {
    return fail(res, '이메일 또는 비밀번호가 올바르지 않습니다.', 401);
  }
  if (user.status === 'BLOCK') {
    return fail(res, '계정이 차단되었습니다.', 403);
  }

  const { accessToken, refreshToken } = db.createSession(user.userNumber);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });

  return ok(res, { userNumber: user.userNumber, accessToken });
});

// ── 로그아웃 ──────────────────────────────────────────────────────────────
// POST /api/logout
router.post('/logout', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (token) db.sessions.delete(token);

  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) db.refreshTokens.delete(refreshToken);

  res.clearCookie('refreshToken');
  return ok(res, true);
});

// ── 토큰 갱신 ─────────────────────────────────────────────────────────────
// POST /api/token/refresh
router.post('/token/refresh', (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return fail(res, '리프레시 토큰이 없습니다.', 401);

  const userNumber = db.refreshTokens.get(refreshToken);
  if (!userNumber) return fail(res, '유효하지 않은 리프레시 토큰입니다.', 401);

  const user = db.users.get(userNumber);
  if (!user) return fail(res, '사용자를 찾을 수 없습니다.', 401);

  db.refreshTokens.delete(refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = db.createSession(userNumber);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });

  return ok(res, { userNumber, accessToken });
});

// ── 이메일 중복 확인 ──────────────────────────────────────────────────────
// GET /api/users-email?email=...
router.get('/users-email', (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return fail(res, '이메일을 입력해주세요.');

  if (db.blockedEmails.has(email)) {
    return ok(res, false); // 탈퇴 후 재가입 제한
  }
  const exists = !!db.getUserByEmail(email);
  return ok(res, !exists); // true = 사용 가능, false = 이미 사용 중
});

// ── 이메일 인증 코드 발송 ─────────────────────────────────────────────────
// POST /api/verify/email/send
router.post('/verify/email/send', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return fail(res, '이메일을 입력해주세요.');

  const sessionToken = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  // E2E 테스트용: @test.com 이메일은 111111로 고정, 그 외는 랜덤
  const verifyCode = email.endsWith('@test.com')
    ? '111111'
    : Math.floor(100000 + Math.random() * 900000).toString();

  db.emailVerifications.set(sessionToken, {
    email,
    sessionToken,
    verifyCode,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10분
  });

  // 개발 환경: 콘솔에 코드 출력 (실제 이메일 발송 대신)
  console.log(`[Mock] 이메일 인증 코드 - ${email}: ${verifyCode}`);

  return ok(res, { sessionToken });
});

// ── 이메일 인증 코드 확인 ─────────────────────────────────────────────────
// POST /api/verify/email
router.post('/verify/email', (req: Request, res: Response) => {
  const { verifyCode, sessionToken } = req.body;

  const verification = db.emailVerifications.get(sessionToken);
  if (!verification) return fail(res, '유효하지 않은 세션입니다.');
  if (Date.now() > verification.expiresAt) {
    db.emailVerifications.delete(sessionToken);
    return fail(res, '인증 코드가 만료되었습니다.');
  }
  if (verification.verifyCode !== verifyCode) {
    return fail(res, '유효하지 않은 인증번호');
  }

  return ok(res, {});
});

// ── 회원가입 ──────────────────────────────────────────────────────────────
// POST /api/users/sign-up
router.post('/users/sign-up', (req: Request, res: Response) => {
  const { email, password, name, ageGroup, gender, preferredTags, sessionToken } = req.body;

  // 세션 토큰 검증
  const verification = db.emailVerifications.get(sessionToken);
  if (!verification || verification.email !== email) {
    return fail(res, '이메일 인증이 완료되지 않았습니다.');
  }

  if (db.getUserByEmail(email)) {
    return fail(res, '이미 사용중인 이메일입니다.');
  }

  const userNumber = db.nextUserId();
  const user: User = {
    userNumber,
    email,
    password,
    name: name || '',
    ageGroup: ageGroup || '20대',
    gender: gender || '',
    preferredTags: preferredTags || [],
    introduction: '',
    profileImageUrl: null,
    status: 'ABLE',
    socialLogin: null,
    socialLoginId: null,
    createdAt: db.now(),
  };
  db.users.set(userNumber, user);
  db.emailVerifications.delete(sessionToken);

  const { accessToken, refreshToken } = db.createSession(userNumber);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  });

  return ok(res, { userNumber, email, accessToken });
});

// ── 회원 탈퇴 ─────────────────────────────────────────────────────────────
// DELETE /api/user/delete
router.delete('/user/delete', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  db.blockedEmails.add(user.email);
  db.users.delete(user.userNumber);
  if (token) db.sessions.delete(token);

  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) db.refreshTokens.delete(refreshToken);
  res.clearCookie('refreshToken');

  return ok(res, true);
});

// ── 소셜 로그인 ───────────────────────────────────────────────────────────
// POST /api/social/login
router.post('/social/login', (req: Request, res: Response) => {
  const { socialLoginId, email } = req.body;
  const user = [...db.users.values()].find(
    (u) => u.socialLoginId === socialLoginId || u.email === email
  );
  if (!user) return fail(res, '소셜 로그인 정보를 찾을 수 없습니다.', 401);

  const { accessToken, refreshToken } = db.createSession(user.userNumber);
  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' });
  // socialLoginMutation.onSuccess 에서 data.userId 를 사용함
  return ok(res, { userId: user.userNumber, accessToken });
});

// ── OAuth 콜백 (Google) ───────────────────────────────────────────────────
// GET /api/login/oauth/google/callback
router.get('/login/oauth/google/callback', (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (code === 'pending-code') {
    return ok(res, {
      userStatus: 'PENDING',
      userNumber: 100,
      userName: '구글유저',
      socialLoginId: 'google-social-id',
      userEmail: 'google@test.com',
    });
  }

  // 기존 유저: 로그인 처리
  let user = [...db.users.values()].find((u) => u.socialLoginId === 'google-social-id');
  if (!user) {
    const userNumber = db.nextUserId();
    user = {
      userNumber,
      email: 'google@test.com',
      password: '',
      name: '구글유저',
      ageGroup: '20대',
      gender: '',
      preferredTags: [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'google',
      socialLoginId: 'google-social-id',
      createdAt: db.now(),
    };
    db.users.set(userNumber, user);
  }
  return ok(res, {
    userStatus: 'ABLE',
    socialLoginId: 'google-social-id',
    userEmail: 'google@test.com',
  });
});

// ── OAuth 콜백 (Kakao) ────────────────────────────────────────────────────
// GET /api/login/oauth/kakao/callback
router.get('/login/oauth/kakao/callback', (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (code === 'pending-code') {
    return ok(res, {
      userStatus: 'PENDING',
      userNumber: 200,
      userName: '카카오유저',
      socialLoginId: 'kakao-social-id',
      userEmail: '',
    });
  }
  let user = [...db.users.values()].find((u) => u.socialLoginId === 'kakao-social-id');
  if (!user) {
    const userNumber = db.nextUserId();
    user = {
      userNumber,
      email: 'kakao@test.com',
      password: '',
      name: '카카오유저',
      ageGroup: '20대',
      gender: '',
      preferredTags: [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'kakao',
      socialLoginId: 'kakao-social-id',
      createdAt: db.now(),
    };
    db.users.set(userNumber, user);
  }
  return ok(res, {
    userStatus: 'ABLE',
    socialLoginId: 'kakao-social-id',
    userEmail: 'kakao@test.com',
  });
});

// ── OAuth 콜백 (Naver) ────────────────────────────────────────────────────
// GET /api/login/oauth/naver/callback
router.get('/login/oauth/naver/callback', (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (code === 'pending-code') {
    return ok(res, { userStatus: 'PENDING', userNumber: 300 });
  }
  let user = [...db.users.values()].find((u) => u.socialLoginId === 'naver-social-id');
  if (!user) {
    const userNumber = db.nextUserId();
    user = {
      userNumber,
      email: 'naver@test.com',
      password: '',
      name: '네이버유저',
      ageGroup: '20대',
      gender: '',
      preferredTags: [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'naver',
      socialLoginId: 'naver-social-id',
      createdAt: db.now(),
    };
    db.users.set(userNumber, user);
  }
  return ok(res, {
    userStatus: 'ABLE',
    socialLoginId: 'naver-social-id',
    userEmail: 'naver@test.com',
  });
});

// ── 소셜 회원가입 완료 (Google) ───────────────────────────────────────────
// PUT /api/social/google/complete-signup
router.put('/social/google/complete-signup', (req: Request, res: Response) => {
  const { userNumber, name, ageGroup, gender, preferredTags } = req.body;
  const user = db.users.get(userNumber);
  if (!user) {
    const newUser: User = {
      userNumber,
      email: req.body.email || 'google@test.com',
      password: '',
      name,
      ageGroup,
      gender,
      preferredTags: preferredTags || [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'google',
      socialLoginId: 'google-social-id',
      createdAt: db.now(),
    };
    db.users.set(userNumber, newUser);
  } else {
    Object.assign(user, { name, ageGroup, gender, preferredTags });
  }
  const { accessToken, refreshToken } = db.createSession(userNumber);
  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' });
  return ok(res, { userNumber, accessToken });
});

// ── 소셜 회원가입 완료 (Kakao) ────────────────────────────────────────────
// PUT /api/social/kakao/complete-signup
router.put('/social/kakao/complete-signup', (req: Request, res: Response) => {
  const { userNumber, name, ageGroup, gender, preferredTags } = req.body;
  const user = db.users.get(userNumber);
  if (!user) {
    const newUser: User = {
      userNumber,
      email: req.body.email || '',
      password: '',
      name,
      ageGroup,
      gender,
      preferredTags: preferredTags || [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'kakao',
      socialLoginId: 'kakao-social-id',
      createdAt: db.now(),
    };
    db.users.set(userNumber, newUser);
  } else {
    Object.assign(user, { name, ageGroup, gender, preferredTags });
  }
  const { accessToken, refreshToken } = db.createSession(userNumber);
  res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' });
  return ok(res, { userNumber, accessToken });
});

export default router;
