'use client'
import MoingFullLogo from '@/components/icons/MoingFullLogo'
import { authStore } from '@/store/client/authStore'
import { splashOnStore } from '@/store/client/splashOnOffStore'
import { useRouter } from 'next/navigation'
import React, { useEffect, useLayoutEffect } from 'react'

export default function Splash() {
  const { splashOn, addSplashOn } = splashOnStore()

  const { accessToken } = authStore()
  const router = useRouter()

  // useLayoutEffect: 브라우저 첫 페인트 전에 동기적으로 실행
  // splashOn 초기값이 false(SSR 호환)이므로, 첫 방문 시 여기서 true로 설정
  // → 유저는 SSR HTML을 보지 못하고 바로 Splash를 봄 (깜빡임 없음)
  useLayoutEffect(() => {
    const revisit = sessionStorage.getItem('revisit')

    if (revisit === undefined || revisit === null) {
      addSplashOn(true)
      sessionStorage.setItem('revisit', 'true')
      setTimeout(() => {
        const themeColorMetaTag = document.querySelector('meta[name="theme-color"]')
        if (themeColorMetaTag) {
          themeColorMetaTag.setAttribute('content', '#F5F5F5')
        }
        addSplashOn(false)
      }, 1500)
    }
  }, [])

  useEffect(() => {
    const revisit = sessionStorage.getItem('revisit')
    if (splashOn === false && revisit !== 'true') {
      // 스플래쉬 닫혔고, 방문한 적이 없다면, 온보딩으로.
      if (!accessToken) {
        router.replace('/onBoarding')
      }
    }
  }, [splashOn])

  return (
    <div
      className="pt-[env(safe-area-inset-top)] absolute z-[2500] h-svh top-0 bg-[var(--color-keycolor)] w-svw min-[440px]:w-[390px] min-[440px]:overflow-x-hidden"
      style={{
        opacity: splashOn ? 1 : 0,
        transition: 'opacity 200ms ease-in-out',
        pointerEvents: splashOn ? 'auto' : 'none',
      }}
    >
      <div className="flex h-svh justify-center items-center">
        <MoingFullLogo />
      </div>
    </div>
  )
}
