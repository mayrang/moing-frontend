'use client';
import React, { useEffect, useState } from 'react';
import useVerifyEmail from '@/features/auth/hooks/useVerifyEmail';
import { errorStore } from '@/store/client/errorStore';
import { userStore } from '@/store/client/userStore';
import ResultToast from '@/shared/ui/toast/ResultToast';

const MINUTES_IN_MS = 60 * 1000;
const INTERVAL = 1000;

const VerifyTimer = ({
  setError,
}: {
  setError: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { email } = userStore();
  const [isToastShow, setIsToastShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(MINUTES_IN_MS);
  const second = String(Math.floor(timeLeft / 1000));
  const { verifyEmailSend } = useVerifyEmail();
  const { updateError, setIsMutationError } = errorStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - INTERVAL);
    }, INTERVAL);

    if (timeLeft <= 0) {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer);
    };
  }, [timeLeft]);

  useEffect(() => {
    if (!verifyEmailSend.isPending && verifyEmailSend.isError) {
      updateError(new Error('이미 발송된 이메일입니다. 1분 뒤에 다시 시도해주세요.'));
      setIsMutationError(true);
    }
    if (verifyEmailSend.isSuccess) {
      setIsToastShow(true);
      setTimeLeft(MINUTES_IN_MS);
    }
  }, [verifyEmailSend.isPending, verifyEmailSend.isError, verifyEmailSend.isSuccess]);

  const onClickRequest = () => {
    setError('');
    verifyEmailSend.mutate({ email });
  };

  if (timeLeft < 1) {
    return (
      <div className="w-full flex items-center justify-center">
        <ResultToast
          bottom="80px"
          isShow={isToastShow}
          setIsShow={setIsToastShow}
          text="인증 코드를 재전송했어요"
        />
        <button
          type="button"
          className="font-semibold leading-[16px] text-sm tracking-[-0.025em] text-[var(--color-keycolor)] underline"
          onClick={onClickRequest}
        >
          코드가 전송되지 않았나요?
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
      <ResultToast
        bottom="80px"
        isShow={isToastShow}
        setIsShow={setIsToastShow}
        text="인증 코드를 재전송했어요"
      />
      <div className="font-normal text-sm leading-[16px] tracking-[-0.025em] text-[var(--color-text-muted)]">
        코드 재전송까지 {second}초
      </div>
    </div>
  );
};

export default VerifyTimer;
