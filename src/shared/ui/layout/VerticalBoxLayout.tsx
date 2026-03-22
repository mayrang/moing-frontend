'use client';
import Badge from '@/shared/ui/badge/Badge';
import Spacing from './Spacing';
import PersonIcon from '@/components/icons/PersonIcon';
import EmptyHeartIcon from '@/shared/ui/icons/EmptyHeartIcon';
import FullHeartIcon from '@/shared/ui/icons/FullHeartIcon';

interface VerticalBoxProps {
  postId: string;
  daysLeft: number;
  title: string;
  recruits: number;
  total: number;
  description: string;
  userName: string;
  daysAgo: number;
  imgSrc?: string;
  tags: string[];
  userIdBookmarked: string[];
}

const VerticalBoxLayout = ({
  postId,
  daysLeft,
  title,
  recruits,
  total,
  description,
  userName,
  daysAgo,
  imgSrc = '',
  tags,
  userIdBookmarked,
}: VerticalBoxProps) => {
  const cutTagList = tags.length > 3 ? tags.slice(0, 2) : tags;
  const userId = '1';
  let isBookmarked = false;
  if (userId !== null) {
    isBookmarked = userIdBookmarked.some((id: string) => id === userId.toString());
  }

  return (
    <div className="flex flex-col max-w-[180px] justify-center">
      <div
        className="relative w-[171px] h-[176px] rounded-[20px] bg-cover"
        style={{ backgroundImage: `url(${imgSrc})` }}
      >
        <div className="absolute bottom-0 w-full border-[0px_0px_20px_20px]">
          <Badge text="마감까지" width="100%" borderRadius="0px 0px 20px 20px" daysLeft={daysLeft} />
        </div>
        <div className="absolute right-3 top-3 p-[5px]">
          {isBookmarked ? <FullHeartIcon /> : <EmptyHeartIcon />}
        </div>
      </div>
      <Spacing size={8} />
      <div className="pl-2 pr-[5px]">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-base leading-[19.09px] text-[var(--color-text-base)] text-left">
            {title}
          </h4>
          <div className="flex items-center gap-1 w-[31px] h-[14px]">
            <PersonIcon width={9} height={10.8} />
            <div className="text-xs font-medium leading-[14.32px] flex items-center text-[var(--color-keycolor)]">
              {recruits}/{total}
            </div>
          </div>
        </div>
        <Spacing size={8} />
        <p className="text-sm text-[#ababab] leading-[16.71px] whitespace-nowrap overflow-hidden text-ellipsis">
          {description}
        </p>
        <Spacing size={7} />
        <div className="text-sm leading-[16.71px]">
          {userName === '' ? '김모잉' : userName}&nbsp;&#183;&nbsp;{daysAgo}일&nbsp;전
        </div>
        <Spacing size={8} />
        <div className="flex items-center">{/* tags placeholder */}</div>
      </div>
    </div>
  );
};

export default VerticalBoxLayout;
