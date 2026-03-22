'use client';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import useCommunity from '@/hooks/useCommunity';
import CustomLink from '@/shared/ui/layout/CustomLink';
import CommunityItem from './CommunityItem';
import { useSearchParams } from 'next/navigation';

const CommunityInfinite = ({ isMine = false }: { isMine?: boolean }) => {
  const [ref, inView] = useInView();
  const searchParams = useSearchParams();
  const sort = searchParams?.get('sortingTypeName') ?? '최신순';
  const categoryName = searchParams?.get('categoryName') ?? '전체';

  const {
    communityList: { data, isFetching, hasNextPage, fetchNextPage, isLoading },
  } = useCommunity(
    undefined,
    { sortingTypeName: sort, categoryName },
    isMine
  );

  useInfiniteScroll(() => {
    if (inView) !isFetching && hasNextPage && fetchNextPage();
  }, [inView, !isFetching, fetchNextPage, hasNextPage]);

  return (
    <div className="px-6">
      {!isLoading &&
        data &&
        data.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.content.map((content) => (
              <CustomLink key={content.postNumber} to={`/community/detail/${content.postNumber}`}>
                <CommunityItem data={content} />
              </CustomLink>
            ))}
          </React.Fragment>
        ))}
      <div ref={ref} style={{ height: 130 }} />
    </div>
  );
};

export default CommunityInfinite;
