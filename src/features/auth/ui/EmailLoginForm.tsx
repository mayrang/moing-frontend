'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Spacing from '@/shared/ui/layout/Spacing';
import { Button } from '@/shared/ui';
import { InfoText } from '@/shared/ui';
import useAuth from '../hooks/useAuth';
import { StateInputField } from '@/shared/ui';
import Link from 'next/link';
import { zodResolver } from '@/shared/lib/zodResolver';
import { sanitizeFormData } from '@/shared/lib/sanitize';
import { loginSchema, LoginFormData } from '@/utils/schema';

const EmailLoginForm = () => {
  const {
    loginEmail,
    loginEmailMutation: { isError, isPending, isSuccess },
  } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  useEffect(() => {
    if (isSuccess) reset();
  }, [isSuccess, reset]);

  useEffect(() => {
    if (!isPending && isError) {
      setError('root', { message: '로그인 정보를 다시 확인해주세요.' });
    }
  }, [isError, isPending, setError]);

  const onSubmit = (data: LoginFormData) => {
    clearErrors('root');
    loginEmail(sanitizeFormData(data));
  };

  return (
    <form
      className="px-6 flex w-full text-sm flex-col leading-[16px] tracking-[-0.04px] justify-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <StateInputField
        handleRemoveValue={() => setValue('email', '', { shouldValidate: true })}
        type="email"
        value={emailValue}
        placeholder="이메일 아이디"
        height={54}
        showIcon={true}
        hasError={!!errors.email && (emailValue?.length ?? 0) > 0}
        success={!errors.email && (emailValue?.length ?? 0) > 0}
        showSuccessIcon={false}
        {...register('email')}
      />
      {errors.email && (emailValue?.length ?? 0) > 0 && (
        <InfoText hasError>{errors.email.message}</InfoText>
      )}
      <Spacing size={16} />
      <StateInputField
        showSuccessIcon={false}
        handleRemoveValue={() => setValue('password', '', { shouldValidate: true })}
        type="password"
        height={54}
        showIcon={true}
        value={passwordValue}
        placeholder="패스워드"
        success={false}
        {...register('password')}
      />
      <Spacing size={14} />
      {errors.root ? (
        <InfoText shake hasError>
          {errors.root.message}
        </InfoText>
      ) : (
        <Spacing size={16} />
      )}
      <Spacing size={24} />
      <div className="flex justify-center gap-[6px] items-center">
        <span className="text-[var(--color-text-muted)]">처음 오셨나요?</span>
        <Link href="/registerEmail" style={{ textDecoration: 'underline' }}>
          회원가입
        </Link>
      </div>
      <Spacing size={26} />
      <Button
        text="로그인"
        disabled={!isValid}
        type="submit"
        addStyle={
          isValid
            ? undefined
            : {
                backgroundColor: 'rgba(220, 220, 220, 1)',
                color: 'rgba(132, 132, 132, 1)',
                boxShadow: '-2px 4px 5px 0px rgba(170, 170, 170, 0.1)',
              }
        }
      />
    </form>
  );
};

export default EmailLoginForm;
