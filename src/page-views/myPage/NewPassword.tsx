"use client";
import Button from "@/components/designSystem/Buttons/Button";
import ButtonContainer from "@/components/ButtonContainer";
import StateInputField from "@/components/designSystem/input/StateInputField";
import InfoText from "@/components/designSystem/text/InfoText";
import Spacing from "@/components/Spacing";
import useMyPage from "@/hooks/myPage/useMyPage";
import { myPageStore } from "@/store/client/myPageStore";
import { userStore } from "@/store/client/userStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/lib/zodResolver";
import { sanitizeFormData } from "@/shared/lib/sanitize";
import { newPasswordSchema, NewPasswordFormData } from "@/utils/schema";

export default function NewPassword() {
  const { addIsPasswordUpdated } = myPageStore();
  const { userSocialTF } = myPageStore();
  const { addPassword, email } = userStore();
  const { updatePasswordMutation, isUpatedPassword, isUpdatedPasswordError } = useMyPage();
  const router = useRouter();

  useEffect(() => {
    if (userSocialTF) router.replace("/editMyInfo");
  }, [userSocialTF]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(
      newPasswordSchema.superRefine((data, ctx) => {
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
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password');
  const confirmValue = watch('confirmPassword');

  useEffect(() => {
    if (isUpatedPassword) {
      addPassword(passwordValue);
      addIsPasswordUpdated(true);
      router.push("/editMyInfo");
    }
  }, [isUpatedPassword]);

  useEffect(() => {
    if (isUpdatedPasswordError) {
      setError('password', { message: '새 비밀번호가 일치하지 않습니다.' });
    }
  }, [isUpdatedPasswordError, setError]);

  const onSubmit = async (data: NewPasswordFormData) => {
    const sanitized = sanitizeFormData(data);
    try {
      const res = await updatePasswordMutation({
        newPassword: sanitized.password,
        newPasswordConfirm: sanitized.confirmPassword,
      });
      if (res === undefined) throw new Error();
    } catch {
      setError('password', { message: '새 비밀번호가 일치하지 않습니다.' });
    }
  };

  return (
    <form className="px-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col">
        <label htmlFor="password" className="text-base font-semibold leading-4 text-[var(--color-text-base)] text-left">
          새로운 비밀번호를 입력해주세요
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
        <Spacing size={8} />
        {errors.password ? (
          <InfoText hasError>{errors.password.message}</InfoText>
        ) : !errors.password && (passwordValue?.length ?? 0) > 0 ? (
          <InfoText success>영문 대문자, 특수문자 포함 8~20자</InfoText>
        ) : (
          <InfoText>영문 대문자, 특수문자 포함 8~20자</InfoText>
        )}
      </div>

      <Spacing size={14} />
      <div className="flex w-full flex-col">
        <StateInputField
          shake={!!errors.confirmPassword}
          handleRemoveValue={() => setValue('confirmPassword', '', { shouldValidate: true })}
          type="password"
          placeholder="비밀번호 재입력"
          hasError={!!errors.confirmPassword}
          value={confirmValue}
          success={!errors.confirmPassword && (confirmValue?.length ?? 0) > 0}
          {...register('confirmPassword')}
        />
        <Spacing size={10} />
        {errors.confirmPassword ? (
          <InfoText hasError>{errors.confirmPassword.message}</InfoText>
        ) : (
          <Spacing size={16} />
        )}
      </div>
      <ButtonContainer>
        {isValid ? (
          <Button text="완료" type="submit" />
        ) : (
          <Button
            text="완료"
            addStyle={{
              backgroundColor: "rgba(220, 220, 220, 1)",
              color: "rgba(132, 132, 132, 1)",
              boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
            }}
            disabled={true}
          />
        )}
      </ButtonContainer>
    </form>
  );
}
