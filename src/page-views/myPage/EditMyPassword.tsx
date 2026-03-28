"use client";
import Button from "@/components/designSystem/Buttons/Button";
import ButtonContainer from "@/components/ButtonContainer";
import Spacing from "@/components/Spacing";
import useMyPage from "@/hooks/myPage/useMyPage";
import { userStore } from "@/store/client/userStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ValidationInputField from "@/components/designSystem/input/ValidationInputField";
import { myPageStore } from "@/store/client/myPageStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/lib/zodResolver";
import { sanitizeFormData } from "@/shared/lib/sanitize";
import { verifyCurrentPasswordSchema, VerifyCurrentPasswordFormData } from "@/utils/schema";

export default function EditMyPassword() {
  const { verifyPasswordMutation, isVerifiedError, isVerified } = useMyPage();
  const { userSocialTF } = myPageStore();
  const { addPassword } = userStore();
  const router = useRouter();

  useEffect(() => {
    if (userSocialTF) {
      router.replace("/editMyInfo");
    }
  }, [userSocialTF]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isValid },
  } = useForm<VerifyCurrentPasswordFormData>({
    resolver: zodResolver(verifyCurrentPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '' },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: VerifyCurrentPasswordFormData) => {
    const sanitized = sanitizeFormData(data);
    try {
      const result = await verifyPasswordMutation(sanitized.password);
      if (result === undefined) throw new Error();
      addPassword(sanitized.password);
      router.push("/editMyPassword2");
    } catch {
      setError('password', { message: '비밀번호가 틀렸습니다.' });
    }
  };

  return (
    <form className="px-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col">
        <label htmlFor="password" className="text-base font-semibold leading-4 text-[var(--color-text-base)] text-left">
          현재 비밀번호를 입력해주세요
        </label>
        <Spacing size={16} />
        <ValidationInputField
          handleRemoveValue={() => setValue('password', '', { shouldValidate: true })}
          type="password"
          shake={!!errors.password}
          placeholder="현재 비밀번호"
          hasError={!!errors.password}
          value={passwordValue}
          success={!errors.password && (passwordValue?.length ?? 0) > 0}
          message={errors.password?.message ?? ""}
          {...register('password')}
        />
      </div>

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
            disabled={true}
          />
        )}
      </ButtonContainer>
    </form>
  );
}
