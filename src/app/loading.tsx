// 홈 페이지 로딩 스켈레톤
export default function HomeLoading() {
  return (
    <div className="bg-[var(--color-search-bg)] w-full animate-pulse">
      {/* 헤더 */}
      <div className="h-[116px] fixed top-0 left-0 w-full max-[440px]:w-full min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 z-[1000] bg-[var(--color-search-bg)] pt-[52px] px-6 pb-4">
        <div className="flex justify-between items-center h-12">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="w-12 h-12 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="w-full px-6 mt-[116px] pt-4">
        {/* 인사말 */}
        <div className="h-7 w-40 bg-gray-200 rounded mb-2" />

        {/* 검색창 */}
        <div className="h-12 w-full bg-gray-200 rounded-2xl mb-6" />

        {/* 북마크 섹션 */}
        <div className="h-5 w-24 bg-gray-200 rounded mb-3" />
        <div className="flex gap-3 overflow-hidden mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[140px] h-[160px] bg-gray-200 rounded-2xl" />
          ))}
        </div>

        {/* 참가 가능 여행 */}
        <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
        <div className="flex gap-3 overflow-hidden mb-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[200px] h-[220px] bg-gray-200 rounded-2xl" />
          ))}
        </div>

        {/* 추천 여행 */}
        <div className="h-5 w-28 bg-gray-200 rounded mb-3" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-[100px] bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
