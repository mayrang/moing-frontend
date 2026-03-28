"use client";
import React, { useEffect, useState } from "react";
import { getToken } from "@/api/user";
import { userStore } from "@/store/client/userStore";
import useAuth from "@/hooks/user/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import WarningToast from "@/shared/ui/toast/WarningToast";

const OauthKakao = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get("code"); // 카카오에서 받은 인증 코드
  const state = searchParams?.get("state");
  const { setSocialLogin, setTempName } = userStore();
  const { socialLogin, socialLoginMutation } = useAuth();
  const { isError, isSuccess } = socialLoginMutation;
  const [toastText, setToastText] = useState("");
  const [isToastShow, setIsToastShow] = useState(false);

  const showErrorToast = (message: string, redirectPath: string) => {
    setToastText(message);
    setIsToastShow(true);
    setTimeout(() => router.replace(redirectPath), 1500);
  };

  useEffect(() => {
    if (code && state) {
      getToken("kakao", code, state)
        .then((user: any) => {
          if (user?.userStatus === "PENDING" && user?.userNumber && user?.userName) {
            setTempName(user.userName);
            setSocialLogin("kakao", Number(user.userNumber) as number);
            router.push("/registerEmail");
          } else if (user?.userStatus === "ABLE") {
            socialLogin({
              socialLoginId: user?.socialLoginId as string,
              email: user?.userEmail as string,
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

export default OauthKakao;
