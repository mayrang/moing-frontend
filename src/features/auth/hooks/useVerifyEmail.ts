"use client";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/shared/api";
import { createMutationOptions } from "@/shared/lib/errors";
import { AUTH_ERROR_POLICY } from "../lib/authErrorPolicy";

const useVerifyEmail = () => {
  const verifyEmailSend = useMutation({
    ...createMutationOptions({
      mutationFn: async ({ email }: { email: string }) => {
        const response = await axiosInstance.post("/api/verify/email/send", { email });
        if (!response.data?.success) {
          // business 에러: 이미 사용 중인 이메일 등
          const reason = response.data?.error?.reason ?? "이메일 전송에 실패했습니다.";
          throw Object.assign(new Error(reason), { response: { status: 400, data: response.data } });
        }
        return response.data;
      },
      policy: AUTH_ERROR_POLICY,
      onBusinessError: (error) => {
        // RegisterEmail 페이지의 onSubmit에서 checkEmail()로 선처리하므로
        // 여기까지 오는 business 에러는 드뭄 → 상위 컴포넌트가 isError 감지 후 처리
      },
    }),
    onSuccess: (data: any) => {
      if (data?.success?.sessionToken) {
        sessionStorage.setItem("sessionToken", data.success.sessionToken);
      }
    },
  });

  const verifyEmail = useMutation({
    ...createMutationOptions({
      mutationFn: async ({ verifyCode }: { verifyCode: string }) => {
        const sessionToken = sessionStorage.getItem("sessionToken") ?? "";
        const response = await axiosInstance.post("/api/verify/email", { verifyCode, sessionToken });
        if (!response.data?.success) {
          const reason = response.data?.error?.reason ?? "인증번호가 올바르지 않습니다.";
          throw Object.assign(new Error(reason), { response: { status: 400, data: response.data } });
        }
        return response.data;
      },
      policy: AUTH_ERROR_POLICY,
      onBusinessError: (_error) => {
        // VerifyEmail 페이지에서 verifyEmail.isError 감지 후 인라인 에러 표시
      },
    }),
    mutationKey: ["verifyEmailCode"],
  });

  return { verifyEmailSend, verifyEmail };
};

export default useVerifyEmail;
