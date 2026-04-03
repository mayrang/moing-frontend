"use client";
import { authStore } from "@/store/client/authStore";
import { axiosInstance, handleApiResponse } from "@/shared/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IRegisterEmail, IRegisterGoogle, IRegisterKakao } from "@/entities/user";
import { userStore } from "@/store/client/userStore";
import { getJWTHeader } from "@/utils/user";
import { usePathname, useRouter } from "next/navigation";
import { createMutationOptions, extractErrorMessage } from "@/shared/lib/errors";
import { logger } from "@/shared/lib/logger";
import { AUTH_ERROR_POLICY } from "../lib/authErrorPolicy";

const useAuth = () => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setLoginData, clearLoginData, accessToken, resetData, setIsGuestUser } = authStore();
  const { setSocialLogin } = userStore();

  const loginEmailMutation = useMutation({
    ...createMutationOptions({
      mutationFn: async ({ email, password }: { email: string; password: string }) => {
        const response = await axiosInstance.post("/api/login", { email, password });
        if (response.data.success.status === "BLOCK") {
          window.location.href = response.data.success.redirectUrl;
        }
        return handleApiResponse(response) as any;
      },
      policy: AUTH_ERROR_POLICY,
      onBusinessError: (_err, _vars) => {
        // EmailLoginForm의 setError로 처리 (폼 레벨에서 isError 감지 후 처리)
      },
    }),
    mutationKey: ["emailLogin"],
    onSuccess: (data) => {
      const userId = Number(data.userId);
      setLoginData({ userId, accessToken: data.accessToken });
      logger.setUser({ id: userId });
      const redirectPath = localStorage.getItem("loginPath") || "/";
      localStorage.removeItem("loginPath");
      router.push(redirectPath);
    },
  });

  const socialLoginMutation = useMutation({
    ...createMutationOptions({
      mutationFn: async ({ socialLoginId, email }: { socialLoginId: string; email: string }) => {
        const response = await axiosInstance.post("/api/social/login", { email, socialLoginId });
        return handleApiResponse(response) as any;
      },
      policy: AUTH_ERROR_POLICY,
      onBusinessError: (error) => {
        const message = extractErrorMessage(error, "소셜 로그인 과정에서 문제가 발생했습니다.");
        // OauthCallback 페이지에서 WarningToast로 표시 후 /login 리다이렉트
        // → socialLoginMutation.isError 감지 후 처리
        router.replace("/login");
      },
    }),
    onSuccess: (data) => {
      const userId = Number(data.userId);
      setLoginData({ userId, accessToken: data.accessToken });
      logger.setUser({ id: userId });
      const redirectPath = localStorage.getItem("loginPath") || "/";
      localStorage.removeItem("loginPath");
      router.push(redirectPath);
    },
  });

  const registerEmailMutation = useMutation({
    ...createMutationOptions({
      mutationFn: async (formData: IRegisterEmail) => {
        const response = await axiosInstance.post("/api/users/sign-up", formData);
        return handleApiResponse(response) as any;
      },
      policy: AUTH_ERROR_POLICY,
    }),
    onSuccess: (data) => {
      const userId = Number(data.userNumber);
      setLoginData({ userId, accessToken: data.accessToken });
      logger.setUser({ id: userId });
    },
  });

  const registerSocialMutation = useMutation({
    ...createMutationOptions({
      mutationFn: async (formData: IRegisterGoogle | IRegisterKakao) => {
        const { social, ...data } = formData;
        const finalData = { ...data, ageGroup: data.agegroup };
        const path =
          formData.social === "google"
            ? "/api/social/google/complete-signup"
            : "/api/social/kakao/complete-signup";
        const response = await axiosInstance.put(path, finalData);
        return handleApiResponse(response) as any;
      },
      policy: AUTH_ERROR_POLICY,
    }),
    onSuccess: (data) => {
      const userId = Number(data.userNumber);
      setLoginData({ userId, accessToken: data.accessToken });
      logger.setUser({ id: userId });
    },
  });

  const logoutMutation = useMutation({
    ...createMutationOptions({
      mutationFn: async () => {
        return await axiosInstance.post("/api/logout", {}, { headers: getJWTHeader(accessToken as string) });
      },
      policy: { network: 'ignore', system: 'ignore' }, // 로그아웃은 에러 무시, 항상 로컬 상태 초기화
    }),
    onSuccess: () => {
      logger.setUser(null);
      clearLoginData();
      resetData();
      setSocialLogin(null, null);
      queryClient.clear();
      window.location.href = "/";
    },
    onError: () => {
      // 로그아웃 실패해도 로컬 상태는 초기화
      logger.setUser(null);
      clearLoginData();
      resetData();
      setSocialLogin(null, null);
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const refreshTokenMutation = useMutation({
    ...createMutationOptions({
      mutationFn: async () => {
        const response = await axiosInstance.post("/api/token/refresh", {});
        return handleApiResponse(response) as any;
      },
      policy: { network: 'ignore', system: 'ignore' }, // 토큰 갱신 실패는 게스트 전환
    }),
    mutationKey: ["refresh"],
    onSuccess: (data) => {
      setLoginData({ userId: Number(data.userId), accessToken: data.accessToken });
    },
    onError: () => {
      setIsGuestUser(true);
    },
  });

  return {
    loginEmail: loginEmailMutation.mutate,
    registerEmail: registerEmailMutation.mutate,
    logout: logoutMutation.mutate,
    userPostRefreshToken: refreshTokenMutation.mutate,
    socialLogin: socialLoginMutation.mutate,
    registerSocial: registerSocialMutation.mutate,
    registerSocialMutation,
    socialLoginMutation,
    loginEmailMutation,
    registerEmailMutation,
    logoutMutation,
    refreshTokenMutation,
  };
};

export default useAuth;
