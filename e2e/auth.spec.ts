/**
 * auth E2E 테스트
 *
 * API mock: MSW HTTP 서버 (localhost:9090) — playwright.config.ts의 webServer 설정 참조
 * Next.js는 API_BASE_URL=http://localhost:9090 으로 실행되어
 * 모든 /api/* 요청이 MSW 서버로 프록시됨.
 *
 * 커버 범위:
 * - 이메일 로그인 (성공/실패/유효성/네트워크 오류/BLOCK 유저)
 * - 이메일 회원가입 전체 플로우 (RegisterEmail → RegisterDone)
 * - 이메일 인증 (코드 입력 / 잘못된 코드 / 타이머 재전송)
 * - OAuth 콜백 (Google PENDING/ABLE, Kakao PENDING/ABLE, Naver ABLE/에러)
 * - 접근성 axe 자동 검사 (각 인증 페이지)
 * - 성능 메트릭 베이스라인
 *
 * 실행: yarn test:e2e --project=chromium e2e/auth.spec.ts
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// MSW 공유 db 상태 충돌 방지 — 파일 내 모든 테스트 직렬 실행
test.describe.configure({ mode: 'serial' });

// ────────────────────────────────────────────────────────────
// 공통 헬퍼
// ────────────────────────────────────────────────────────────

/**
 * Terms 모달("동의합니다" 버튼)을 클릭하고 이메일 폼이 보일 때까지 기다린다.
 *
 * 배경: Terms는 dynamic import + 슬라이드업 애니메이션으로 렌더됨.
 * - Playwright 일반 click은 애니메이션 도중 "element not stable" 오류 발생
 * - page.evaluate로 DOM 직접 클릭 → React onClick 정상 발화, setShowTerms(false) 호출
 * - evaluate 후 즉시 fill하면 React 상태 업데이트 전에 실행되어 폼이 inactive 상태
 *   → expect(getByText('이메일 주소를 입력해주세요')).toBeVisible() wait 필수
 */
const acceptTerms = async (page: any) => {
  await page.goto('/registerEmail');
  await page.waitForFunction(
    () => !!Array.from(document.querySelectorAll('button')).find(
      (b: any) => b.textContent?.trim() === '동의합니다' && !b.hasAttribute('disabled')
    )
  );
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b: any) => b.textContent?.trim() === '동의합니다' && !b.hasAttribute('disabled')
    ) as HTMLButtonElement | undefined;
    btn?.click();
  });
  // React 상태 업데이트(setShowTerms→false) 완료 대기
  await expect(page.getByText('이메일 주소를 입력해주세요')).toBeVisible();
};

/**
 * ValidationInputField(forwardRef 수정 후)에 값을 입력한다.
 * RHF ref가 DOM input까지 전달되므로 locator.fill()이 onChange를 정상 트리거한다.
 */
const fillReactInput = async (page: any, placeholder: string, value: string) => {
  await page.locator(`[placeholder="${placeholder}"]`).fill(value);
};

/** RegisterEmail → VerifyEmail 진입 */
const goToVerifyEmail = async (page: any, email = 'new@test.com') => {
  await acceptTerms(page);
  await fillReactInput(page, '이메일 입력', email);
  await expect(page.getByRole('button', { name: '다음' })).toBeEnabled();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/verifyEmail');
};

/** RegisterEmail → VerifyEmail → RegisterPassword 진입 */
const goToRegisterPassword = async (page: any, email = 'new@test.com') => {
  await goToVerifyEmail(page, email);
  for (let i = 1; i <= 6; i++) {
    await page.getByLabel(`${i}번째 숫자`).fill('1');
  }
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/registerPassword');
};

/**
 * RegisterEmail → ... → RegisterDone 진입 (전체 이메일 회원가입 플로우)
 * MSW: new@test.com, 인증코드 111111(고정), Password1234! 사용
 */
const goToRegisterDone = async (page: any) => {
  // 고유 이메일 사용 — new@test.com 중복 등록 방지
  const uniqueEmail = `reg${Date.now()}@test.com`;
  await goToRegisterPassword(page, uniqueEmail);

  // 비밀번호 입력 → /registerName
  await page.fill('[placeholder="비밀번호 입력"]', 'Password1234!');
  await page.fill('[placeholder="비밀번호 재입력"]', 'Password1234!');
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/registerName');

  // 이름 입력 → /registerAge
  await page.fill('[placeholder="이름 입력(최대 10자)"]', '테스트유저');
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/registerAge');

  // 나이 선택 → /registerAge/registerGender
  await page.getByRole('button', { name: '20대' }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/registerAge/registerGender');

  // 성별 선택 → /registerTripStyle (남자/여자는 div 클릭 구조)
  await page.getByText('남자').click();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/registerTripStyle');

  // 여행 스타일 태그 1개 선택 후 완료 → /registerDone
  await page.getByRole('button', { name: '🇰🇷 국내' }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page).toHaveURL('/registerDone');
};

// ────────────────────────────────────────────────────────────
// 1. 이메일 로그인
// ────────────────────────────────────────────────────────────

test.describe('이메일 로그인', () => {
  test('유효한 정보로 로그인하면 홈(/)으로 이동한다', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
    await page.fill('[placeholder="패스워드"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });

  test('잘못된 정보로 로그인하면 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[placeholder="이메일 아이디"]', 'wrong@test.com');
    await page.fill('[placeholder="패스워드"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page.getByText('로그인 정보를 다시 확인해주세요.')).toBeVisible();
  });

  test('이메일과 패스워드가 모두 유효할 때만 로그인 버튼이 활성화된다', async ({ page }) => {
    await page.goto('/login');

    const loginButton = page.getByRole('button', { name: '로그인', exact: true });
    await expect(loginButton).toBeDisabled();

    // 이메일만 입력 → 여전히 비활성
    await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
    await expect(loginButton).toBeDisabled();

    // 패스워드 추가 → 활성화
    await page.fill('[placeholder="패스워드"]', 'Password123!');
    await expect(loginButton).toBeEnabled();
  });

  test('빈 필드로 로그인 시 유효성 검사가 동작한다', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[placeholder="이메일 아이디"]', 'invalid-email');
    await expect(page.getByText('이메일 주소를 정확하게 입력해주세요.')).toBeVisible();
  });

  test('비로그인 상태에서 둘러보기 버튼을 누르면 홈(/)으로 이동한다', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('둘러보기').click();
    await expect(page).toHaveURL('/');
  });

  test('회원가입 링크 클릭 시 이메일 등록 페이지로 이동한다', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: '회원가입' }).click();
    await expect(page).toHaveURL('/registerEmail');
  });
});

// ────────────────────────────────────────────────────────────
// 2. 로그아웃
// ────────────────────────────────────────────────────────────

test.describe('로그아웃', () => {
  test('로그인 후 홈으로 이동한다', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[placeholder="이메일 아이디"]', 'test@test.com');
    await page.fill('[placeholder="패스워드"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });
});

// ────────────────────────────────────────────────────────────
// 3. 이메일 회원가입 — 전체 플로우
// ────────────────────────────────────────────────────────────

test.describe('이메일 회원가입', () => {
  // 각 테스트 전에 MSW db 리셋 — new@test.com 재사용 가능하게
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:9090/api/test/reset');
  });

  test.describe('Step 1: 약관 동의 및 이메일 입력 (RegisterEmail)', () => {
    test('약관 동의 화면이 처음에 표시된다', async ({ page }) => {
      await page.goto('/registerEmail');
      await expect(page.getByText('동의가 필요해요.')).toBeVisible();
    });

    test('약관 동의 후 이메일 입력 폼이 표시된다', async ({ page }) => {
      await acceptTerms(page);
      // acceptTerms 내부에서 이미 expect(getByText('이메일 주소를 입력해주세요')).toBeVisible() 확인됨
    });

    test('유효하지 않은 이메일 입력 시 다음 버튼이 비활성화된다', async ({ page }) => {
      await acceptTerms(page);
      await fillReactInput(page, '이메일 입력', 'not-an-email');
      await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
    });

    test('이미 사용 중인 이메일 입력 시 에러 메시지가 표시된다', async ({ page }) => {
      await acceptTerms(page);
      await fillReactInput(page, '이메일 입력', 'duplicate@test.com');
      await page.getByRole('button', { name: '다음' }).click();

      await expect(page.getByText('이미 사용중인 이메일입니다.')).toBeVisible();
    });

    test('사용 가능한 이메일 입력 후 인증 페이지로 이동한다', async ({ page }) => {
      await goToVerifyEmail(page);
    });
  });

  test.describe('Step 2: 이메일 인증 코드 (VerifyEmail)', () => {
    test('6자리 코드 입력 전에는 다음 버튼이 비활성화된다', async ({ page }) => {
      await goToVerifyEmail(page);
      await expect(page.getByRole('button', { name: '다음' })).toBeDisabled();
    });

    test('6자리 코드 입력 완료 시 다음 버튼이 활성화된다', async ({ page }) => {
      await goToVerifyEmail(page);

      for (let i = 1; i <= 6; i++) {
        await page.getByLabel(`${i}번째 숫자`).fill(String(i));
      }
      await expect(page.getByRole('button', { name: '다음' })).toBeEnabled();
    });

    test('잘못된 인증 코드 입력 시 에러 메시지가 표시된다', async ({ page }) => {
      await goToVerifyEmail(page);

      // MSW: 000000은 잘못된 코드로 처리
      for (let i = 1; i <= 6; i++) {
        await page.getByLabel(`${i}번째 숫자`).fill('0');
      }
      await page.getByRole('button', { name: '다음' }).click();

      await expect(page.getByText('유효하지 않은 인증번호입니다.')).toBeVisible();
    });

    test('올바른 인증 코드 입력 시 비밀번호 등록 페이지로 이동한다', async ({ page }) => {
      await goToRegisterPassword(page);
    });
  });

  test.describe('Step 3: 비밀번호 등록 (RegisterPassword)', () => {
    test('비밀번호 규칙 위반 시 에러 메시지가 표시된다', async ({ page }) => {
      await goToRegisterPassword(page);

      // 대문자/특수문자 없음
      await page.fill('[placeholder="비밀번호 입력"]', 'password1');
      await expect(page.getByText('영문 대문자, 특수문자 포함 8~20자')).toBeVisible();
    });

    test('비밀번호 불일치 시 에러 메시지가 표시된다', async ({ page }) => {
      await goToRegisterPassword(page);

      await page.fill('[placeholder="비밀번호 입력"]', 'Password123!');
      await page.fill('[placeholder="비밀번호 재입력"]', 'Password456!');
      await expect(page.getByText('비밀번호가 일치하지 않습니다.')).toBeVisible();
    });

    test('올바른 비밀번호 입력 시 이름 등록 페이지로 이동한다', async ({ page }) => {
      await goToRegisterPassword(page);

      await page.fill('[placeholder="비밀번호 입력"]', 'Password123!');
      await page.fill('[placeholder="비밀번호 재입력"]', 'Password123!');
      await page.getByRole('button', { name: '다음' }).click();

      await expect(page).toHaveURL('/registerName');
    });
  });

  test.describe('Step 4: 이름 등록 (RegisterName)', () => {
    test('email/password 없이 직접 접근 시 이메일 등록 페이지로 리다이렉트된다', async ({ page }) => {
      await page.goto('/registerName');
      await expect(page).toHaveURL('/registerEmail');
    });
  });

  test.describe('전체 플로우 — RegisterDone 자동 로그인', () => {
    test('회원가입 완료 후 로그인 페이지가 아닌 홈(/)으로 이동한다', async ({ page }) => {
      await goToRegisterDone(page);
      // RegisterDone: 2초 후 router.replace("/") 동작 확인
      await expect(page).toHaveURL('/', { timeout: 5000 });
    });
  });
});

// ────────────────────────────────────────────────────────────
// 4. OAuth 콜백
// ────────────────────────────────────────────────────────────

test.describe('OAuth 콜백', () => {
  test.describe('Google OAuth', () => {
    test('PENDING 유저 — 나이/성별 등록 페이지로 이동한다', async ({ page }) => {
      // MSW: code=pending-code 이면 PENDING 응답
      await page.goto('/login/oauth/google/callback?code=pending-code&state=mock-state');
      await expect(page).toHaveURL('/registerAge');
    });

    test('ABLE 유저 — 소셜 로그인 후 홈으로 이동한다', async ({ page }) => {
      // MSW: code=able-code (기본값) 이면 ABLE 응답
      await page.goto('/login/oauth/google/callback?code=able-code&state=mock-state');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Kakao OAuth', () => {
    test('PENDING 유저 — 이메일 입력 페이지로 이동한다', async ({ page }) => {
      await page.goto('/login/oauth/kakao/callback?code=pending-code&state=mock-state');
      await expect(page).toHaveURL('/registerEmail');
    });

    test('ABLE 유저 — 소셜 로그인 후 홈으로 이동한다', async ({ page }) => {
      await page.goto('/login/oauth/kakao/callback?code=able-code&state=mock-state');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Naver OAuth', () => {
    test('ABLE 유저 — 소셜 로그인 후 홈으로 이동한다', async ({ page }) => {
      await page.goto('/login/oauth/naver/callback?code=able-code&state=mock-state');
      await expect(page).toHaveURL('/');
    });

    test('PENDING 유저 — 에러 처리 후 로그인 페이지로 이동한다 (Naver 신규 가입 미지원)', async ({ page }) => {
      page.on('dialog', (dialog) => dialog.accept());
      await page.goto('/login/oauth/naver/callback?code=pending-code&state=mock-state');
      await expect(page).toHaveURL('/login');
    });
  });
});

// ────────────────────────────────────────────────────────────
// 5. 접근성 — axe 자동 검사 (베이스라인 측정)
// ────────────────────────────────────────────────────────────

test.describe('접근성 (axe 베이스라인)', () => {
  /**
   * 개선 전 위반 항목을 기록하는 용도입니다.
   * 위반이 있어도 현재는 실패하지 않고 콘솔에 출력합니다.
   * 개선 완료 후 expect(results.violations).toHaveLength(0) 으로 전환 예정.
   */
  const logAxeResults = (results: { violations: any[] }, pageName: string) => {
    if (results.violations.length > 0) {
      console.log(`\n[axe] ${pageName} — ${results.violations.length}개 위반 발견`);
      results.violations.forEach((v) => {
        console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
        console.log(`    영향받는 요소: ${v.nodes.length}개`);
      });
    } else {
      console.log(`\n[axe] ${pageName} — 위반 없음 ✓`);
    }
  };

  test('로그인 페이지 접근성 검사', async ({ page }) => {
    await page.goto('/login');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('nextjs-portal')
      .analyze();

    logAxeResults(results, '/login');
    expect(results).toBeDefined();
  });

  test('이메일 입력 페이지 접근성 검사 — 약관 모달', async ({ page }) => {
    await page.goto('/registerEmail');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('nextjs-portal')
      .analyze();

    logAxeResults(results, '/registerEmail (약관 모달)');
    expect(results).toBeDefined();
  });

  test('이메일 입력 페이지 접근성 검사 — 폼', async ({ page }) => {
    await acceptTerms(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('nextjs-portal')
      .analyze();

    logAxeResults(results, '/registerEmail (이메일 폼)');
    expect(results).toBeDefined();
  });

  test('이메일 인증 페이지 접근성 검사', async ({ page }) => {
    await goToVerifyEmail(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('nextjs-portal')
      .analyze();

    logAxeResults(results, '/verifyEmail');
    expect(results).toBeDefined();
  });

  test('비밀번호 등록 페이지 접근성 검사', async ({ page }) => {
    await goToRegisterPassword(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('nextjs-portal')
      .analyze();

    logAxeResults(results, '/registerPassword');
    expect(results).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────
// 6. 성능 메트릭 — 베이스라인 측정
// ────────────────────────────────────────────────────────────

test.describe('성능 메트릭 (베이스라인)', () => {
  const measurePerf = async (page: any, url: string, label: string) => {
    await page.goto(url, { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((p) => p.name === 'first-contentful-paint');

      return {
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        load: Math.round(nav.loadEventEnd - nav.startTime),
        fcp: fcp ? Math.round(fcp.startTime) : null,
      };
    });

    console.log(`\n[Perf] ${label} (${url})`);
    console.log(`  TTFB:              ${metrics.ttfb}ms`);
    console.log(`  FCP:               ${metrics.fcp ?? 'N/A'}ms`);
    console.log(`  DOMContentLoaded:  ${metrics.domContentLoaded}ms`);
    console.log(`  Load:              ${metrics.load}ms`);

    return metrics;
  };

  test('로그인 페이지 성능 측정', async ({ page }) => {
    const metrics = await measurePerf(page, '/login', '로그인');
    expect(metrics).toBeDefined();
  });

  test('이메일 등록 페이지 성능 측정', async ({ page }) => {
    const metrics = await measurePerf(page, '/registerEmail', '이메일 등록');
    expect(metrics).toBeDefined();
  });
});
