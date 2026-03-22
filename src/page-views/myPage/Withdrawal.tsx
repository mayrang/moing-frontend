'use client'
import Button from '@/components/designSystem/Buttons/Button'
import ButtonContainer from '@/components/ButtonContainer'
import CheckIcon from '@/components/icons/CheckIcon'
import Spacing from '@/components/Spacing'
import useMyPage from '@/hooks/myPage/useMyPage'
import { myPageStore } from '@/store/client/myPageStore'
import React, { useEffect, useState } from 'react'

import useViewTransition from '@/hooks/useViewTransition'

export default function Withdrawal() {
  const [isClicked, setIsClicked] = useState(false)
  const { withdrawMutation, isWithDrawError, isWithDrawSuccess } = useMyPage()
  const { name } = myPageStore()
  const navigateWithTransition = useViewTransition()
  const completeClickHandler = async () => {
    // 탈퇴 api 요청
    try {
      await withdrawMutation()
    } catch (e) {
      // 탈퇴 오류 발생
    }
  }

  useEffect(() => {
    if (isWithDrawSuccess) {
      document.documentElement.style.viewTransitionName = 'easeout'
      navigateWithTransition('/')
    }
  }, [isWithDrawSuccess])

  useEffect(() => {
    // 탈퇴 오류 처리
  }, [isWithDrawError])
  return (
    <div className="mt-6 px-6">
      <div className="py-[10px] gap-[10px]">
        <div className="text-xl font-semibold leading-7 text-left text-[var(--color-text-base)]">
          {name}님, 정말 탈퇴하시겠어요?
          <br /> 너무 아쉬워요 🥺
        </div>
        <div className="mt-[10px] text-base font-normal leading-[22.4px] tracking-[-0.025em] text-left text-[var(--color-text-muted2)]">회원 탈퇴 전에 꼭 확인하세요.</div>
      </div>
      <Spacing size={8} />
      <div className="h-px border-b border-[rgba(231,231,231,1)]"></div>
      <Spacing size={8} />
      <div className="py-[10px] gap-[10px] text-sm font-normal leading-[19.6px] text-left">
        <li>
          회원 탈퇴 시, 해당 계정으로 저장된 항목은 모두 삭제되며 복구가
          불가능합니다.
        </li>
        <li>
          회원 탈퇴 후, 3개월 내에 동일한 이메일 계정으로 재가입이 불가능합니다.
        </li>
      </div>
      <Spacing size={8} />
      <div className="h-px border-b border-[rgba(231,231,231,1)]"></div>
      <Spacing size={8} />
      <div className="text-base font-normal leading-6 tracking-[-0.025em] text-left py-[10px] gap-[10px]">
        <div>
          그동안 모잉과 함께해 주셔서 감사합니다.
          <br /> 다시 만날 수 있기를 언제나 기다리고 있을게요.
        </div>
      </div>
      <ButtonContainer isWithdrawal={true}>
        <div className="flex items-center justify-between gap-5">
          <button onClick={() => setIsClicked(true)}>
            {isClicked ? (
              <CheckIcon
                status="done"
                size={18}
              />
            ) : (
              <CheckIcon size={18} />
            )}
          </button>
          <h4 className="text-base font-semibold flex-1 leading-4">네, 탈퇴하겠습니다.</h4>
        </div>
        <Button
          disabled={!isClicked}
          text="탈퇴하기"
          onClick={completeClickHandler}
          addStyle={{
            backgroundColor: isClicked
              ? 'rgba(62, 141, 0, 1)'
              : 'rgba(220, 220, 220, 1)',
            color: isClicked ? 'rgba(240, 240, 240, 1)' : 'var(--color-text-muted)',
            boxShadow: 'rgba(170, 170, 170, 0.1)'
          }}
        />
      </ButtonContainer>
    </div>
  )
}
