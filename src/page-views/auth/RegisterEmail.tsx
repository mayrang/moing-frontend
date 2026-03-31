"use client";
import Button from "@/components/designSystem/Buttons/Button";
import Spacing from "@/components/Spacing";
import { userStore } from "@/store/client/userStore";
import React, { useEffect, useState } from "react";
import { checkEmail } from "@/api/user";
import ButtonContainer from "@/components/ButtonContainer";
import useViewTransition from "@/hooks/useViewTransition";
import { useRouter } from "next/navigation";
import ValidationInputField from "@/components/designSystem/input/ValidationInputField";
import useVerifyEmail from "@/hooks/useVerifyEmail";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/lib/zodResolver";
import { sanitizeFormData } from "@/shared/lib/sanitize";
import { registerEmailSchema, RegisterEmailFormData } from "@/utils/schema";
import dynamic from "next/dynamic";
const Terms = dynamic(() => import("@/features/auth/ui/Terms"), { ssr: false });
import { registerDraft } from "@/shared/lib/registerDraft";

const RegisterEmail = () => {
  const { addEmail, email, socialLogin, setSocialLogin } = userStore();
  const [showTerms, setShowTerms] = useState(true);
  const { verifyEmailSend } = useVerifyEmail();
  const navigateWithTransition = useViewTransition();
  const router = useRouter();

  const isSocialLoginGoogle = socialLogin === "google";
  const isSocialLoginNaver = socialLogin === "naver";

  useEffect(() => {
    if (isSocialLoginGoogle || isSocialLoginNaver) {
      setSocialLogin(null, null);
      router.replace("/login");
    }
  }, [socialLogin]);

  useEffect(() => {
    if (verifyEmailSend.isSuccess) {
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition("/verifyEmail");
    }
  }, [verifyEmailSend.isPending, verifyEmailSend.isSuccess]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm<RegisterEmailFormData>({
    resolver: zodResolver(registerEmailSchema),
    mode: "onChange",
    // localStorage 임시 저장 이메일 복구 (Zustand store → localStorage 순으로 우선)
    defaultValues: { email: email || registerDraft.load() || "" },
  });

  const emailValue = watch("email");

  // 이메일 입력 중 localStorage에 임시 저장 (1시간 TTL)
  useEffect(() => {
    if (emailValue) registerDraft.save(emailValue);
  }, [emailValue]);

  const onSubmit = async (data: RegisterEmailFormData) => {
    const sanitized = sanitizeFormData(data);
    const checkingEmail = await checkEmail(sanitized.email);
    if (!checkingEmail) {
      setError("email", { message: "이미 사용중인 이메일입니다." });
      return;
    }
    addEmail(sanitized.email);
    verifyEmailSend.mutate({ email: sanitized.email });
  };

  return (
    <>
      {showTerms && <Terms closeShowTerms={() => setShowTerms(false)} />}
      <form className="px-6 pt-[30px]" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full flex-col">
          <label
            className="text-2xl leading-[34px]  font-semibold px-[6px] tracking-[-0.04em]"
            htmlFor="email"
          >
            이메일 주소를 입력해주세요
          </label>
          <Spacing size={16} />
          <ValidationInputField
            handleRemoveValue={() =>
              setValue("email", "", { shouldValidate: true })
            }
            type="email"
            value={emailValue}
            hasError={!!errors.email}
            success={!errors.email && (emailValue?.length ?? 0) > 0}
            placeholder="이메일 입력"
            shake={!!errors.email}
            message={errors.email?.message ?? ""}
            {...register("email")}
          />
        </div>

        <Spacing size={"6svh"} />

        <ButtonContainer>
          {isValid ? (
            <Button text="다음" type="submit" />
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
      </form>
    </>
  );
};

export default RegisterEmail;
