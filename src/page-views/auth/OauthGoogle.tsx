"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken, OAuthTokenResponse } from "@/entities/user";
import { userStore } from "@/store/client/userStore";
import { useAuth } from "@/features/auth";
import WarningToast from "@/shared/ui/toast/WarningToast";

const OauthGoogle = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams?.get("code");
  const state = searchParams?.get("state");
  const { setSocialLogin, setTempName } = userStore();
  const { socialLogin, socialLoginMutation } = useAuth();
  const { isSuccess } = socialLoginMutation;
  const [toastText, setToastText] = useState("");
  const [isToastShow, setIsToastShow] = useState(false);

  const showErrorToast = (message: string, redirectPath: string) => {
    setToastText(message);
    setIsToastShow(true);
    setTimeout(() => router.replace(redirectPath), 1500);
  };

  useEffect(() => {
    if (code && state) {
      getToken("google", code, state)
        .then((user: OAuthTokenResponse | null | undefined) => {
          if (user?.userStatus === "PENDING" && user?.userNumber && user?.userName) {
            setTempName(user.userName);

            setSocialLogin("google", user.userNumber!);
            router.push("/registerAge");
          } else if (user?.userStatus === "ABLE") {
            socialLogin({
              socialLoginId: user.socialLoginId!,
              email: user.userEmail!,
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

export default OauthGoogle;
