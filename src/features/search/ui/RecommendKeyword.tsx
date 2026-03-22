'use client'
import Spacing from '@/components/Spacing'
import { SearchFilterTag } from '@/shared/ui'

const TAG_LIST = ['유럽', '일본', '제주', '강릉', '미국']

interface RecoomendKeywordProps {
  setKeyword: (keyword: string) => void
}

const RecommendKeyword = ({ setKeyword }: RecoomendKeywordProps) => {
  return (
    <div>
      <h5 className="text-sm font-medium leading-[16.71px]">추천 검색어</h5>
      <Spacing size={14} />
      <div className="flex items-center justify-around">
        {TAG_LIST.map((keyword, idx) => (
          <SearchFilterTag
            idx={idx}
            text={keyword}
            key={keyword}
            onClick={() => setKeyword(keyword)}
          />
        ))}
      </div>
    </div>
  )
}

export default RecommendKeyword
