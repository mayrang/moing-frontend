import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import EmailLoginForm from './EmailLoginForm';
import { axe } from 'jest-axe';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('@/store/client/authStore', () => ({
  authStore: () => ({
    setLoginData: vi.fn(),
    clearLoginData: vi.fn(),
    accessToken: null,
    resetData: vi.fn(),
    setIsGuestUser: vi.fn(),
  }),
}));

vi.mock('@/store/client/userStore', () => ({
  userStore: () => ({ setSocialLogin: vi.fn() }),
}));

vi.mock('@/store/client/backPathStore', () => ({
  useBackPathStore: () => ({}),
}));

vi.mock('@/utils/user', () => ({
  getJWTHeader: (token: string) => ({ Authorization: `Bearer ${token}` }),
}));

vi.mock('@/context/ReqeustError', () => ({
  default: class RequestError extends Error {
    constructor(message: any) {
      super(String(message));
    }
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

const renderForm = () =>
  render(<EmailLoginForm />, { wrapper: createWrapper() });

describe('EmailLoginForm', () => {
  it('이메일, 패스워드 입력 필드와 로그인 버튼이 렌더링된다', () => {
    renderForm();
    expect(screen.getByPlaceholderText('이메일 아이디')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('패스워드')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
  });

  it('유효하지 않은 이메일 입력 시 에러 메시지가 표시된다', async () => {
    renderForm();
    const emailInput = screen.getByPlaceholderText('이메일 아이디');

    fireEvent.change(emailInput, { target: { name: 'email', value: 'invalid-email' } });

    await waitFor(() => {
      expect(screen.getByText(/이메일/i)).toBeInTheDocument();
    });
  });

  it('유효한 이메일과 패스워드 입력 시 로그인 버튼이 활성화된다', async () => {
    renderForm();
    const emailInput = screen.getByPlaceholderText('이메일 아이디');
    const passwordInput = screen.getByPlaceholderText('패스워드');
    const button = screen.getByRole('button', { name: /로그인/ });

    expect(button).toBeDisabled();

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'Password123!' } });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = renderForm();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
