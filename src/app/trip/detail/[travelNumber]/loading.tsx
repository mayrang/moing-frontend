// 여행 상세 페이지 로딩 스켈레톤
export default function TripDetailLoading() {
  return (
    <div className="bg-[var(--color-bg)] animate-pulse min-h-svh">
      {/* TopModal 영역: 프로필 + 제목 + 정보 */}
      <div className="px-6 pt-[52px]">
        {/* 뒤로가기 */}
        <div className="w-8 h-8 bg-gray-200 rounded-full mb-4" />

        {/* 프로필 행 */}
        <div className="flex items-center gap-2 mt-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>

        {/* 제목 */}
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />

        {/* 본문 3줄 */}
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 rounded" />
        </div>

        {/* 태그 */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 w-16 bg-gray-200 rounded-full" />
          ))}
        </div>

        {/* 정보 행: 장소 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[100px] flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-4 w-8 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>

        {/* 정보 행: 날짜 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[100px] flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>

        {/* 정보 행: 인원 */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-[100px] flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-4 w-10 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="w-full h-[300px] bg-gray-200 mb-6" />

      {/* 여행 일정 */}
      <div className="px-6">
        <div className="h-5 w-20 bg-gray-200 rounded mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-[80px] bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
