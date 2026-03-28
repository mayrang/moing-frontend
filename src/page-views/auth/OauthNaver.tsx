"use client";
import React, { useEffect, useState } from "react";

import { getToken } from "@/entities/user";
import { userStore } from "@/store/client/userStore";
import { useAuth } from "@/features/auth";
import { useRouter, useSearchParams } from "next/navigation";
import WarningToast from "@/shared/ui/toast/WarningToast";

const OauthNaver = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get("code"); // 네이버에서 받은 인증 코드
  const state = searchParams?.get("state");
  const { socialLogin, socialLoginMutation } = useAuth();
  const { setSocialLogin } = userStore();
  const { isSuccess, isPending, isError } = socialLoginMutation;
  const [toastText, setToastText] = useState("");
  const [isToastShow, setIsToastShow] = useState(false);

  const showErrorToast = (message: string, redirectPath: string) => {
    setToastText(message);
    setIsToastShow(true);
    setTimeout(() => router.replace(redirectPath), 1500);
  };

  useEffect(() => {
    if (code && state) {
      // 네이버 인증 코드를 이용해 서버에서 토큰을 요청

      getToken("naver", code, state)
        .then((user: any) => {
          if (user?.userStatus === "ABLE") {
            socialLogin({
              socialLoginId: user?.socialLoginId as string,
              email: user?.email as string,
            });
          } else {
            showErrorToast("소셜 로그인 과정에서 문제가 발생했습니다.", "/login");
          }
        })
        .catch((error) => {
          const message = error?.error ? error.error : "소셜 로그인 과정에서 문제가 발생했습니다.";
          showErrorToast(message, "/login");
        });
    }
  }, [code, state]);

  return (
    <WarningToast isShow={isToastShow} setIsShow={setIsToastShow} text={toastText} />
  );
};

export default OauthNaver;
