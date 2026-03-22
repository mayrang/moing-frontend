'use client';
import Comment from '@/features/comment/ui/Comment';
import CommentForm from '@/features/comment/ui/CommentForm';
import useComment from '@/hooks/comment/useComment';
import React from 'react';
import useInfiniteScroll from '@/shared/hooks/useInfiniteScroll';
import { useInView } from 'react-intersection-observer';
import { useParams } from 'next/navigation';

const CommunityComment = () => {
  const params = useParams();
  const communityNumber = params?.communityNumber as string;
  const [ref, inView] = useInView();

  if (!communityNumber) return null;

  const {
    commentList: { isLoading, data, isFetching, hasNextPage, fetchNextPage },
  } = useComment('community', Number(communityNumber));

  useInfiniteScroll(() => {
    if (inView) !isFetching && hasNextPage && fetchNextPage();
  }, [inView, !isFetching, fetchNextPage, hasNextPage]);

  return (
    <div className="py-[22px] bg-[#f5f5f5] overflow-y-auto">
      <div className="mb-2 text-base text-[var(--color-text-muted)] font-semibold leading-[19.09px]">
        댓글 {data?.pages[0]?.page?.totalElements ?? 0}
      </div>
      {!isLoading &&
        data &&
        data.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.content.map((comment) => (
              <Comment
                userNumber={comment.userNumber}
                key={comment.commentNumber}
                comment={comment}
                relatedType="community"
                relatedNumber={Number(communityNumber)}
              />
            ))}
          </React.Fragment>
        ))}
      <div ref={ref} style={{ height: 130 }} />
      <CommentForm relatedType="community" relatedNumber={Number(communityNumber)} />
    </div>
  );
};

export default CommunityComment;
