"use client";
import Button from "@/components/designSystem/Buttons/Button";
import StateInputField from "@/components/designSystem/input/StateInputField";
import InfoText from "@/components/designSystem/text/InfoText";
import Spacing from "@/components/Spacing";
import { userStore } from "@/store/client/userStore";
import { useEffect } from "react";
import ButtonContainer from "@/components/ButtonContainer";
import useViewTransition from "@/hooks/useViewTransition";
import { useRouter } from "next/navigation";
import ValidationInputField from "@/components/designSystem/input/ValidationInputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/lib/zodResolver";
import { sanitizeFormData } from "@/shared/lib/sanitize";
import { registerPasswordSchema, RegisterPasswordFormData } from "@/utils/schema";

const RegisterPassword = () => {
  const { addPassword, email, password, socialLogin, setSocialLogin } = userStore();
  const navigateWithTransition = useViewTransition();
  const router = useRouter();

  const isSocialLoginGoogle = socialLogin === "google";
  const isSocialLoginKakao = socialLogin === "kakao";
  const isSocialLoginNaver = socialLogin === "naver";
  const isRegisterEmail = socialLogin === null;

  useEffect(() => {
    if (isSocialLoginGoogle || isSocialLoginNaver || isSocialLoginKakao) {
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
  } = useForm<RegisterPasswordFormData>({
    resolver: zodResolver(
      registerPasswordSchema.superRefine((data, ctx) => {
        const emailLocalPart = email.split("@")[0];
        if (data.password === email || data.password === emailLocalPart) {
          ctx.addIssue({
            code: "custom",
            path: ["password"],
            message: "이메일과 동일한 형식의 비밀번호는 사용할 수 없습니다.",
          });
        }
      })
    ),
    mode: 'onChange',
    defaultValues: { password: password || '', confirmPassword: password || '' },
  });

  const passwordValue = watch('password');
  const confirmValue = watch('confirmPassword');

  const onSubmit = (data: RegisterPasswordFormData) => {
    const sanitized = sanitizeFormData(data);
    addPassword(sanitized.password);
    document.documentElement.style.viewTransitionName = "forward";
    if (isSocialLoginKakao) {
      navigateWithTransition("/registerAge");
    } else {
      navigateWithTransition("/registerName");
    }
  };

  return (
    <form className="px-6 pt-[30px]" onSubmit={handleSubmit(onSubmit)}>
      {isRegisterEmail && (
        <>
          <div className="flex w-full flex-col">
            <label
              className="text-2xl leading-[34px] font-semibold px-[6px] tracking-[-0.04em]"
              htmlFor="password"
            >
              비밀번호를 입력해주세요
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
            <Spacing size={16} />
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
  );
};

export default RegisterPassword;
