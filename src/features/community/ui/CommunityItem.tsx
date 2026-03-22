'use client';
import React from 'react';
import SearchFilterTag from '@/shared/ui/tag/SearchFilterTag';
import EmptyHeartIcon from '@/shared/ui/icons/EmptyHeartIcon';
import CommentIcon from '@/components/icons/CommentIcon';
import { ICommunityItem } from '@/model/community';
import { daysAgoFormatted } from '@/utils/time';

const CommunityItem = ({ data }: { data: ICommunityItem }) => {
  return (
    <div className="flex flex-col gap-2 h-[133px] justify-center border-b border-[var(--color-muted4)] py-[11px] pb-4">
      <div className="flex items-center gap-[26px]">
        <div className="flex-1 flex flex-col overflow-hidden justify-center gap-2">
          <div>
            <SearchFilterTag
              text={data.categoryName}
              idx={0}
              addStyle={{
                backgroundColor: 'var(--color-muted4)',
                color: 'var(--color-text-muted)',
                border: 'none',
                borderRadius: '20px',
                fontSize: '12px',
                lineHeight: '14px',
                padding: '4px 10px',
                fontWeight: '400',
              }}
            />
          </div>
          <div className="text-base font-semibold pl-1 leading-[19.09px]">{data.title}</div>
          <div className="text-sm font-normal pl-1 leading-[16.71px] whitespace-nowrap overflow-hidden text-ellipsis text-[var(--color-text-muted)]">
            {data.content}
          </div>
        </div>
        {data.thumbnailUrl && (
          <div
            className="rounded-[20px] bg-cover h-full w-[74px] aspect-square"
            style={{ backgroundImage: `url(${data.thumbnailUrl})` }}
          />
        )}
      </div>
      <div className="flex items-center pl-1">
        <div className="flex gap-1 text-[var(--color-text-muted2)] text-xs text-center leading-[16.71px] font-normal flex-1">
          <div>{data.postWriter}</div>
          <div className="text-sm font-medium text-[var(--color-muted3)]">·</div>
          <div>{daysAgoFormatted(data.regDate)}</div>
          <div className="text-sm font-medium text-[var(--color-muted3)]">·</div>
          <div>조회수 {data.viewCount}</div>
        </div>
        <div className="flex items-center text-[var(--color-text-muted2)] font-[Pretendard] text-xs font-medium leading-[14.32px] gap-2">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6">
              <EmptyHeartIcon width={17.42} height={15.19} stroke="var(--color-text-muted2)" />
            </div>
            <span>{data.likeCount}</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6">
              <CommentIcon size={15} stroke="var(--color-text-muted2)" />
            </div>
            <span>{data.commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityItem;
