'use client'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ThreeRowCarousel from '@/components/ThreeRowCarousel'

import React from 'react'
import { useTripList } from '@/hooks/useTripList'
import { userStore } from '@/store/client/userStore'
import { IMyTripList } from '@/model/myTrip'
import OnBoardingOne from '@/components/icons/OnBoardingOne'
import OnBoardingTwo from '@/components/icons/OnBoardingTwo'
import OnBoardingThree from '@/components/icons/OnBoardingThree'
interface OnBoardingData {
  title: string
  description: string
  svg: React.ReactNode
}

export default function OnBoarding() {
  const { data } = useTripList('recommend')
  const { name } = userStore()

  const trips = (data?.pages[0].content as IMyTripList['content']) ?? []
  const cutTrips = trips?.length > 9 ? trips.slice(0, 3) : trips

  const steps: OnBoardingData[] = [
    {
      title: `누구나 자유롭게 \n 만드는 여행`,
      description: `여행 멤버들을 모집하고, \n 설레는 여행을 떠나보세요!`,
      svg: <OnBoardingOne />
    },
    {
      title: `원하는 조건만 쏙! \n 맞춤 여행 검색`,
      description: `떠나고 싶은 곳 또는 나와 딱 맞는 \n 스타일의 여행을 찾을 수 있어요.`,
      svg: <OnBoardingTwo />
    },
    {
      title: `모잉 멤버들과 \n 나누는 여행 이야기`,
      description: `여행에 대한 정보와 팁 등\n 다양한 이야기를 공유해보세요.`,
      svg: <OnBoardingThree />
    }
  ]

  return (
    <div className="flex w-full h-svh">
      <ThreeRowCarousel
        needNextBtn={true}
        rowsProp={1}
        itemCountProp={0}>
        {steps.map(step => (
          <div
            style={{ padding: '18px 16px' }}
            key={step.title}>
            <div>
              <div className="whitespace-pre-line text-[26px] font-semibold leading-[36.4px] text-[var(--color-text-base)] text-center mb-4">{step.title}</div>
              <div className="whitespace-pre-line text-base font-normal leading-[22.4px] tracking-[-0.25px] text-center text-[var(--color-text-muted)]">{step.description}</div>
            </div>
            <div className="flex justify-center">{step.svg}</div>
          </div>
        ))}
      </ThreeRowCarousel>
    </div>
  )
}
