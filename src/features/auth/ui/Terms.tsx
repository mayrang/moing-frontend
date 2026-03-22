'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WhiteXIcon from '@/components/icons/WhiteXIcon';
import Spacing from '@/shared/ui/layout/Spacing';
import CheckIcon from '@/shared/ui/icons/CheckIcon';
import Button from '@/shared/ui/button/Button';
import ResultToast from '@/shared/ui/toast/ResultToast';

interface TermsProps {
  closeShowTerms: () => void;
}

const Terms = ({ closeShowTerms }: TermsProps) => {
  const [check, setCheck] = useState({ service: true, privacy: true });
  const [isToastShow, setIsToastShow] = useState(false);
  const router = useRouter();

  const handleBackButton = () => {
    router.push('/login');
  };

  const handleCheck = (item: 'privacy' | 'service') => {
    if (check[item]) {
      setIsToastShow(true);
    }
    setCheck((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="h-svh fixed z-[9999] w-full top-0 left-0 min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 bg-black/60">
      <button
        type="button"
        className="absolute top-6 left-6 cursor-pointer"
        onClick={handleBackButton}
      >
        <WhiteXIcon />
      </button>
      <div className="w-full min-[440px]:w-[390px] absolute bottom-0 px-[30px] pt-12 rounded-tl-[18px] rounded-tr-[18px] bg-white animate-[slideUpMobile_0.5s_ease-out_forwards]">
        <h2 className="text-2xl tracking-[-0.04px] font-semibold leading-[33.6px]">
          모잉을 이용하기 위해
          <br />
          <span className="text-[var(--color-keycolor)]">동의</span>가 필요해요.
        </h2>
        <div className="h-px w-full my-[30px] bg-[rgba(205,205,205,1)]" />
        <div className="flex items-center justify-between gap-5">
          <button type="button" className="cursor-pointer" onClick={() => handleCheck('service')}>
            {check.service ? <CheckIcon status="done" size={18} /> : <CheckIcon size={18} />}
          </button>
          <h4 className="text-base font-semibold flex-1 leading-[16px]">
            (필수) 서비스 이용 약관
          </h4>
          <a href="/pdf/service_terms(241115).pdf" target="_blank" rel="noreferrer">
            <span className="text-[rgba(171,171,171,1)] text-sm font-medium leading-[16px] underline">
              보기
            </span>
          </a>
        </div>
        <Spacing size={24} />
        <div className="flex items-center justify-between gap-5">
          <button type="button" className="cursor-pointer" onClick={() => handleCheck('privacy')}>
            {check.privacy ? <CheckIcon status="done" size={18} /> : <CheckIcon size={18} />}
          </button>
          <h4 className="text-base font-semibold flex-1 leading-[16px]">
            (필수) 개인정보 수집, 이용 동의
          </h4>
          <a href="/pdf/privacy_terms(241006).pdf" target="_blank" rel="noreferrer">
            <span className="text-[rgba(171,171,171,1)] text-sm font-medium leading-[16px] underline">
              보기
            </span>
          </a>
        </div>
        <Spacing size={111} />
        {check.privacy && check.service ? (
          <Button text="동의합니다" onClick={closeShowTerms} />
        ) : (
          <Button text="동의합니다" disabled />
        )}
        <Spacing size={40} />
      </div>
      <ResultToast
        bottom="80px"
        isShow={isToastShow}
        setIsShow={setIsToastShow}
        text="필수 항목은 반드시 동의해야 해요."
      />
    </div>
  );
};

export default Terms;
