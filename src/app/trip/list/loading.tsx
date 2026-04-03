// 여행 목록 페이지 로딩 스켈레톤 — async prefetch 대기 중 표시
export default function TripListLoading() {
  return (
    <div className="bg-[var(--color-bg)] animate-pulse">
      {/* 헤더: 검색창 + 알람 */}
      <div className="flex px-6 pt-[52px] pb-4 items-center gap-[22px] sticky top-0 h-[116px] bg-[var(--color-bg)] z-[1000] justify-between">
        <div className="flex-1 h-12 bg-gray-200 rounded-2xl" />
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
      </div>

      {/* 인기 장소 칩 */}
      <div className="px-6 flex gap-2 overflow-hidden mt-2 mb-[31px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 h-8 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>

      {/* 정렬 헤더 */}
      <div className="px-6 pb-[11px] border-b border-[rgb(240,240,240)] flex justify-between items-center">
        <div className="flex gap-4">
          <div className="h-4 w-10 bg-gray-200 rounded" />
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>

      {/* 여행 카드 목록 */}
      <div className="px-6 mt-4 flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-full h-[120px] bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
