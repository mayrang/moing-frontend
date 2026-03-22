"use client";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import CodeInput from "@/components/designSystem/input/CodeInput";
import InfoText from "@/components/designSystem/text/InfoText";
import Spacing from "@/components/Spacing";
import VerifyTimer from "@/components/VerifyTimer";
import useVerifyEmail from "@/hooks/useVerifyEmail";
import useViewTransition from "@/hooks/useViewTransition";
import { errorStore } from "@/store/client/errorStore";
import { userStore } from "@/store/client/userStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const VerifyEmail = () => {
  const [values, setValues] = useState("");
  const navigateWithTransition = useViewTransition();
  const { email, socialLogin, setSocialLogin } = userStore();
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyEmail } = useVerifyEmail();
  const [error, setError] = useState("");
  const isSocialLoginGoogle = socialLogin === "google";
  const isSocialLoginKakao = socialLogin === "kakao";
  const isSocialLoginNaver = socialLogin === "naver";
  const sessionToken = sessionStorage.getItem("sessionToken");
  const handleValueChange = (newValues: string[]) => {
    setValues(newValues.join(""));
  };

  useEffect(() => {
    if (isSocialLoginGoogle || isSocialLoginNaver) {
      setSocialLogin(null, null);
      router.replace("/login");
    } else if (email === "") {
      router.replace("/registerEmail");
    }
  }, [socialLogin, email]);

  const submitVerifyCode = () => {
    if (values.length !== 6) {
      return;
    }
    verifyEmail.mutate({ verifyCode: values });
  };

  useEffect(() => {
    if (!verifyEmail.isPending && verifyEmail.isError) {
      setError("유효하지 않은 인증번호입니다.");
    }
    if (verifyEmail.isSuccess) {
      setError("");
      if (isSocialLoginKakao) {
        document.documentElement.style.viewTransitionName = "forward";
        navigateWithTransition("/registerAge");
      } else {
        document.documentElement.style.viewTransitionName = "forward";
        navigateWithTransition("/registerPassword");
      }
    }
  }, [verifyEmail.isPending, verifyEmail.isError, verifyEmail.isSuccess]);

  return (
    <div className="px-[25px] pt-[30px]">
      <label className="text-2xl leading-[34px] font-semibold px-[6px] tracking-[-0.04em]">
        코드를 입력해주세요
      </label>
      <Spacing size={8} />
      <div className="text-base font-normal text-[var(--color-text-muted)] px-[6px] leading-[140%] tracking-[-0.025em]">
        입력하신 이메일{" "}
        <sub className="text-black">{email}</sub>(으)로 인증 코드를 보냈어요.
      </div>
      <Spacing size={28} />
      <CodeInput refs={inputRefs} onValueChange={handleValueChange} />
      {error === "" ? (
        <Spacing size={8} />
      ) : (
        <>
          <Spacing size={8} />
          <InfoText hasError>{error}</InfoText>
        </>
      )}

      <Spacing size={40} />
      <VerifyTimer setError={setError} />
      <ButtonContainer>
        {values.length === 6 ? (
          <Button text="다음" onClick={submitVerifyCode} />
        ) : (
          <Button
            text="다음"
            addStyle={{
              backgroundColor: "rgba(220, 220, 220, 1)",
              color: "rgba(132, 132, 132, 1)",
              boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
            }}
            type="submit"
            disabled={true}
          />
        )}
      </ButtonContainer>
    </div>
  );
};

export default VerifyEmail;
