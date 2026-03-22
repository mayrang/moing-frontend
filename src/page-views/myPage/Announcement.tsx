'use client'

export default function Announcement() {
  return (
    <div className="flex justify-center items-center w-full h-[calc(100svh-200px)]">
      <div className="text-base font-medium leading-[22.4px] text-center text-[var(--color-text-muted)]">
        아직 등록된
        <br /> 공지가 없어요
      </div>
    </div>
  )
}
