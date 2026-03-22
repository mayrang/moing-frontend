'use client'
import MoingFullLogo from '@/components/icons/MoingFullLogo'
import { authStore } from '@/store/client/authStore'
import { splashOnStore } from '@/store/client/splashOnOffStore'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

export default function Splash() {
  const { splashOn, addSplashOn } = splashOnStore()

  const { accessToken } = authStore()
  const router = useRouter()

  useEffect(() => {
    const revisit =
      typeof window !== 'undefined' ? sessionStorage.getItem('revisit') : null

    if (revisit === undefined || revisit === null) {
      setTimeout(() => {
        let themeColorMetaTag = document.querySelector(
          'meta[name="theme-color"]'
        )
        if (themeColorMetaTag) {
          themeColorMetaTag.setAttribute('content', '#F5F5F5')
        }

        addSplashOn(false)
      }, 2000)
      sessionStorage.setItem('revisit', 'true')
    } else if (revisit === 'true') {
      addSplashOn(false)
    }
  }, [])
  useEffect(() => {
    const revisit =
      typeof window !== 'undefined' ? sessionStorage.getItem('revisit') : null
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
