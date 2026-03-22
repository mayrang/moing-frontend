'use client'
import RelationSearchIcon from '@/components/icons/RelationSearchIcon'
import { splitByKeyword } from '@/utils/search'
import { cn } from '@/shared/lib/cn'

interface RelationKeyowrdProps {
  data: string
  keyword: string
}

const RelationKeyword = ({ data, keyword }: RelationKeyowrdProps) => {
  const matchingKeyword = splitByKeyword(keyword, data)

  return (
    <div className="flex items-center gap-5 py-[14px] px-1">
      <RelationSearchIcon />
      <span>
        {matchingKeyword.map((value, idx) => (
          <span
            key={idx}
            className={cn(
              'text-base leading-[19.09px]',
              value.match
                ? 'text-[var(--color-keycolor)] font-bold'
                : 'text-[var(--color-text-base)] font-medium'
            )}
          >
            {value.str}
          </span>
        ))}
      </span>
    </div>
  )
}

export default RelationKeyword
