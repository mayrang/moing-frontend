// 커뮤니티 페이지 로딩 스켈레톤
export default function CommunityLoading() {
  return (
    <div className="bg-[var(--color-bg)] animate-pulse">
      {/* 헤더: 검색 + 알람 */}
      <div className="flex px-6 pt-[52px] pb-4 items-center gap-[22px] sticky top-0 h-[116px] bg-[var(--color-bg)] z-[1000] justify-between">
        <div className="flex-1 h-12 bg-gray-200 rounded-2xl" />
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
      </div>

      {/* 카테고리 탭 */}
      <div className="px-6 flex gap-3 mt-2 mb-4 overflow-hidden">
        {["전체", "잡담", "여행팁", "후기"].map((_, i) => (
          <div key={i} className="flex-shrink-0 h-8 w-14 bg-gray-200 rounded-full" />
        ))}
      </div>

      {/* 정렬 헤더 */}
      <div className="px-6 pb-3 border-b border-[rgb(240,240,240)] flex justify-between items-center">
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 w-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>

      {/* 커뮤니티 카드 목록 */}
      <div className="px-6 mt-4 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full rounded-2xl bg-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-300" />
              <div className="h-3 w-20 bg-gray-300 rounded" />
              <div className="ml-auto h-3 w-10 bg-gray-300 rounded" />
            </div>
            <div className="h-4 w-3/4 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-full bg-gray-300 rounded mb-1" />
            <div className="h-3 w-2/3 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
