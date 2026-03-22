"use client";
import Comment from "@/components/comment/Comment";
import CommentForm from "@/components/comment/CommentForm";
import Spacing from "@/components/Spacing";
import useComment from "@/hooks/comment/useComment";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

import { useParams } from "next/navigation";
import React from "react";
import { useInView } from "react-intersection-observer";

const TripComment = () => {
  const params = useParams();
  const travelNumber = params?.travelNumber as string;

  if (!travelNumber) {
    return null;
  }

  const [ref, inView] = useInView();

  const {
    commentList: { isLoading, data, isFetching, hasNextPage, fetchNextPage },
  } = useComment("travel", Number(travelNumber));

  useInfiniteScroll(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage();
    }
  }, [inView, !isFetching, fetchNextPage, hasNextPage]);
  return (
    <div
      className="px-6 pt-7 overflow-y-auto"
      style={{
        height: "calc(100svh - (calc((16 * 100) / 844) * 1svh + 48px + calc((40 * 100) / 844) * 1svh + 68px + 24px))",
      }}
    >
      {!isLoading && data?.pages && data.pages[0].content.length > 0 ? (
        <>
          {data.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page.content.map((comment, itemIndex) => (
                <Comment
                  userNumber={comment.userNumber}
                  key={comment.commentNumber}
                  comment={comment}
                  relatedType="travel"
                  relatedNumber={Number(travelNumber)}
                />
              ))}
            </React.Fragment>
          ))}
          <div ref={ref} style={{ height: 80 }} />
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center h-full">
            <img
              alt="댓글이 없습니다"
              width={80}
              height={80}
              src={"/images/noData.png"}
            />
            <Spacing size={16} />
            <div className="text-sm font-normal leading-5 tracking-[-0.025em] text-center">
              아직 달린 댓글이 없어요
              <br />
              댓글을 달아보세요
            </div>
          </div>
        </>
      )}
      <CommentForm relatedType="travel" relatedNumber={Number(travelNumber)} />
    </div>
  );
};

export default TripComment;
