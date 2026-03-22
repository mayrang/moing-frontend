'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SearchFilterTag from '@/shared/ui/tag/SearchFilterTag';

const FILTER_LIST = [
  { value: '세계', title: '세계' },
  { value: '국내', title: '국내' },
] as const;

export default function AreaFilter() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') ?? '세계';
  const router = useRouter();
  const pathname = usePathname();

  const clickTag = (value: '세계' | '국내') => () => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    newSearchParams.set('filter', value);
    router.push(pathname + '?' + newSearchParams);
  };

  const isActive = (value: '세계' | '국내') => value === filter;

  return (
    <div className="flex items-center px-6 mt-2 mb-[27px] gap-3">
      {FILTER_LIST.map(({ title, value }, idx) => (
        <SearchFilterTag
          addStyle={{
            backgroundColor: isActive(value) ? 'rgba(227, 239, 217, 1)' : 'rgba(240, 240, 240, 1)',
            color: isActive(value) ? 'var(--color-keycolor)' : 'rgba(52, 52, 52, 1)',
            border: isActive(value)
              ? '1px solid var(--color-keycolor)'
              : '1px solid var(--color-search-bg)',
            borderRadius: '30px',
            padding: '10px 20px',
            fontWeight: isActive(value) ? '600' : '400',
            lineHeight: '22px',
          }}
          text={title}
          onClick={clickTag(value)}
          idx={idx}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  );
}
