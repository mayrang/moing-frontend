'use client'
import CustomLink from '@/components/CustomLink'

const TAG_LIST = [
  { value: '뉴욕', src: '/images/newyork.png' },
  { value: '제주도', src: '/images/jeju.png' },
  { value: '도쿄', src: '/images/tokyo.png' },
  { value: '파리', src: '/images/paris.png' },
  { value: '서울', src: '/images/seoul.png' }
]

const PopularPlaceList = () => {
  return (
    <div className="flex gap-4 flex-col">
      <div className="text-base font-semibold px-6 leading-[16px]">인기 여행 장소</div>
      <div className="flex px-6 relative pb-[3px] w-full overflow-x-auto no-scrollbar items-center gap-2">
        {TAG_LIST.map((item) => (
          <CustomLink
            key={item.value}
            to={`/search/travel?keyword=${item.value}`}
          >
            <div
              className="bg-cover min-w-[80px] w-[80px] h-[80px] flex items-center justify-center text-white rounded-full relative text-sm font-semibold leading-[19.6px]"
              style={{ backgroundImage: `url(${item.src})` }}
            >
              <div className="bg-[#0000004d] absolute top-0 left-0 min-w-[80px] w-[80px] h-[80px] rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10]">
                {item.value}
              </div>
            </div>
          </CustomLink>
        ))}
      </div>
    </div>
  )
}

export default PopularPlaceList
