"use client";
import Button from "@/components/designSystem/Buttons/Button";
import StateInputField from "@/components/designSystem/input/StateInputField";
import InfoText from "@/components/designSystem/text/InfoText";
import Spacing from "@/components/Spacing";
import Terms from "@/components/Terms";
import { userStore } from "@/store/client/userStore";
import React, { useEffect, useState } from "react";
import { checkEmail } from "@/api/user";
import ButtonContainer from "@/components/ButtonContainer";
import useViewTransition from "@/hooks/useViewTransition";
import { useRouter } from "next/navigation";
import ValidationInputField from "@/components/designSystem/input/ValidationInputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/lib/zodResolver";
import { sanitizeFormData } from "@/shared/lib/sanitize";
import { z } from "zod";
import { emailSchema, passwordSchema } from "@/utils/schema";

// RegisterForm은 email + password 한 페이지 구성 (카카오 소셜 포함)
const registerFormSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호를 다시 입력해주세요.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });
type RegisterFormData = z.infer<typeof registerFormSchema>;

const RegisterForm = () => {
  const { addEmail, addPassword, email, password, socialLogin, setSocialLogin } = userStore();
  const [showTerms, setShowTerms] = useState(true);
  const navigateWithTransition = useViewTransition();
  const router = useRouter();

  const isSocialLoginGoogle = socialLogin === "google";
  const isSocialLoginKakao = socialLogin === "kakao";
  const isSocialLoginNaver = socialLogin === "naver";
  const isRegisterEmail = socialLogin === null;

  useEffect(() => {
    if (isSocialLoginGoogle || isSocialLoginNaver) {
      setSocialLogin(null, null);
      router.replace("/login");
    }
  }, [socialLogin]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(
      registerFormSchema.superRefine((data, ctx) => {
        const emailLocalPart = data.email.split("@")[0];
        if (data.password === data.email || data.password === emailLocalPart) {
          ctx.addIssue({
            code: "custom",
            path: ["password"],
            message: "이메일과 동일한 형식의 비밀번호는 사용할 수 없습니다.",
          });
        }
      })
    ),
    mode: 'onChange',
    defaultValues: { email: email || '', password: password || '', confirmPassword: password || '' },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');
  const confirmValue = watch('confirmPassword');

  // 카카오는 email만 필요
  const kakaoValid = isSocialLoginKakao ? !errors.email && (emailValue?.length ?? 0) > 0 : isValid;

  const onSubmit = async (data: RegisterFormData) => {
    const sanitized = sanitizeFormData(data);
    const checkingEmail = await checkEmail(sanitized.email);
    if (!checkingEmail) {
      setError('email', { message: '이미 사용중인 이메일입니다.' });
      return;
    }
    addEmail(sanitized.email);
    if (isSocialLoginKakao) {
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition("/registerAge");
    } else {
      addPassword(sanitized.password);
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition("/registerName");
    }
  };

  return (
    <>
      {showTerms && <Terms closeShowTerms={() => setShowTerms(false)} />}
      <form className="px-6 pt-[7.1svh]" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full flex-col">
          <label className="text-lg tracking-[-0.04em]" htmlFor="email">
            이메일
          </label>
          <Spacing size={16} />
          <ValidationInputField
            handleRemoveValue={() => setValue('email', '', { shouldValidate: true })}
            type="email"
            value={emailValue}
            hasError={!!errors.email}
            success={!errors.email && (emailValue?.length ?? 0) > 0}
            placeholder="이메일 입력"
            shake={!!errors.email}
            message={errors.email?.message ?? ""}
            {...register('email')}
          />
        </div>

        <Spacing size={"6svh"} />
        {isRegisterEmail && (
          <>
            <div className="flex w-full flex-col">
              <label className="text-lg tracking-[-0.04em]" htmlFor="password">
                비밀번호
              </label>
              <Spacing size={16} />
              <StateInputField
                handleRemoveValue={() => setValue('password', '', { shouldValidate: true })}
                type="password"
                shake={!!errors.password}
                placeholder="비밀번호 입력"
                hasError={!!errors.password}
                value={passwordValue}
                success={!errors.password && (passwordValue?.length ?? 0) > 0}
                {...register('password')}
              />
              <Spacing size={10} />
              <div style={{ paddingLeft: 6 }}>
                {errors.password ? (
                  <InfoText hasError>{errors.password.message}</InfoText>
                ) : !errors.password && (passwordValue?.length ?? 0) > 0 ? (
                  <InfoText success>영문 대문자, 특수문자 포함 8~20자</InfoText>
                ) : (
                  <InfoText>영문 대문자, 특수문자 포함 8~20자</InfoText>
                )}
              </div>
            </div>

            <Spacing size={14} />
            <div className="flex w-full flex-col">
              <ValidationInputField
                shake={!!errors.confirmPassword}
                handleRemoveValue={() => setValue('confirmPassword', '', { shouldValidate: true })}
                type="password"
                placeholder="비밀번호 재입력"
                hasError={!!errors.confirmPassword}
                value={confirmValue}
                success={!errors.confirmPassword && (confirmValue?.length ?? 0) > 0}
                message={errors.confirmPassword?.message ?? ""}
                {...register('confirmPassword')}
              />
            </div>
          </>
        )}
        <ButtonContainer>
          {kakaoValid ? (
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

export default RegisterForm;
