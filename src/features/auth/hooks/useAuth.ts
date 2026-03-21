"use client";
import { authStore } from "@/store/client/authStore";

import { axiosInstance, handleApiResponse } from "@/shared/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import RequestError from "@/context/ReqeustError";
import { IRegisterEmail, IRegisterGoogle, IRegisterKakao } from "@/entities/user";
import { userStore } from "@/store/client/userStore";
import { getJWTHeader } from "@/utils/user";
import { usePathname, useRouter } from "next/navigation";
import { useBackPathStore } from "@/store/client/backPathStore";

const noNeedPages = [
  "/login",
  "/registerEmail",
  "/registerName",
  "/registerAge",
  "/registerAge/registerGender",
  "/registerTripStyle",
  "/onBoarding",
  "/",
  "/trip/detail",
  "/myTrip",
];
const isAccessTokenNoNeedpages = (path: string) => {
  return noNeedPages.some((url) => path.startsWith(url));
};

export function checkNetworkConnection() {
  if (!navigator.onLine) {
    return false;
  }
  return true;
}

const useAuth = () => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setLoginData, clearLoginData, accessToken, resetData, setIsGuestUser } = authStore();
  const { setSocialLogin } = userStore();
  const loginEmailMutation = useMutation({
    mutationKey: ["emailLogin"],
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      if (!checkNetworkConnection()) return;

      const response = await axiosInstance.post("/api/login", {
        email,
        password,
      });
      if (response.data.success.status === "BLOCK") {
        window.location.href = response.data.success.redirectUrl;
      }
      return handleApiResponse(response) as any;
    },
    onSuccess: (data) => {
      setLoginData({
        userId: Number(data.userId),
        accessToken: data.accessToken,
      });
      const loginPath = localStorage.getItem("loginPath");
      router.push("/");
      localStorage.removeItem("loginPath");
    },
    onError: (error: any) => {
      console.error(error);
      throw new RequestError(error);
    },
  });

  const socialLoginMutation = useMutation({
    mutationFn: async ({ socialLoginId, email }: { socialLoginId: string; email: string }) => {
      if (!checkNetworkConnection()) return;

      const response = await axiosInstance.post("/api/social/login", {
        email,
        socialLoginId,
      });
      return handleApiResponse(response) as any;
    },
    onSuccess: (data) => {
      setLoginData({
        userId: Number(data.userId),
        accessToken: data.accessToken,
      });
      const loginPath = localStorage.getItem("loginPath");
      router.push("/");
      localStorage.removeItem("loginPath");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error || error?.response?.data?.message || "소셜 로그인 과정에서 문제가 발생했습니다.";

      console.error("Error:", errorMessage);
      alert(errorMessage);
      router.replace("/login");
      throw new RequestError(errorMessage);
    },
  });

  const registerEmailMutation = useMutation({
    mutationFn: async (formData: IRegisterEmail) => {
      if (!checkNetworkConnection()) return;

      const response = await axiosInstance.post("/api/users/sign-up", formData);
      return handleApiResponse(response) as any;
    },
    onSuccess: (data) => {
      setLoginData({
        userId: Number(data.userNumber),
        accessToken: data.accessToken,
      });
    },
    onError: (error: any) => {
      console.error(error);
      throw new RequestError(error);
    },
  });

  const registerSocialMutation = useMutation({
    mutationFn: async (formData: IRegisterGoogle | IRegisterKakao) => {
      if (!checkNetworkConnection()) return;
      const { social, ...data } = formData;
      const finalData = { ...data, ageGroup: data.agegroup };
      const path =
        formData.social === "google" ? "/api/social/google/complete-signup" : "/api/social/kakao/complete-signup";

      const response = await axiosInstance.put(path, finalData);
      return handleApiResponse(response) as any;
    },
    onSuccess: (data) => {
      setLoginData({
        userId: Number(data.userNumber),
        accessToken: data.accessToken,
      });
    },
    onError: (error: any) => {
      console.error(error);
      throw new RequestError(error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!checkNetworkConnection()) return;

      return await axiosInstance.post("/api/logout", {}, { headers: getJWTHeader(accessToken as string) });
    },
    onSuccess: () => {
      clearLoginData();
      resetData();

      setSocialLogin(null, null);
      if (typeof window === "undefined") {
        router.replace("/");
      } else {
        window.location.href = "/";
      }

      queryClient.clear();
    },
    onError: (error: any) => {
      console.error(error);
      throw new RequestError(error);
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/api/token/refresh", {});
      return handleApiResponse(response) as any;
    },
    onSuccess: (data) => {
      setLoginData({
        userId: Number(data.userId),
        accessToken: data.accessToken,
      });
    },
    mutationKey: ["refresh"],
    onError: (error: any) => {
      setIsGuestUser(true);
      console.error(error);
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
