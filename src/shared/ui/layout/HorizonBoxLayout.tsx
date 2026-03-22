'use client';
import Badge from '@/shared/ui/badge/Badge';
import PersonIcon from '@/components/icons/PersonIcon';
import BoxLayoutTag from '@/shared/ui/tag/BoxLayoutTag';
import EmptyHeartIcon from '@/shared/ui/icons/EmptyHeartIcon';
import PlaceIcon from '@/components/icons/PlaceIcon';
import FullHeartIcon from '@/shared/ui/icons/FullHeartIcon';
import { useUpdateBookmark } from '@/hooks/bookmark/useUpdateBookmark';
import { authStore } from '@/store/client/authStore';
import { useEffect, useRef, useState } from 'react';
import CheckingModal from '@/shared/ui/modal/CheckingModal';
import { usePathname, useRouter } from 'next/navigation';
import { isGuestUser } from '@/utils/user';
import { cn } from '@/shared/lib/cn';

interface HorizonBoxProps {
  daysLeft?: number;
  title: string;
  recruits: number;
  total: number;
  isBookmark?: boolean;
  location?: string;
  userName: string;
  daysAgo: string;
  imgSrc?: string;
  tags: string[];
  showTag?: boolean;
  isBar?: boolean;
  bookmarkPosition?: 'top' | 'middle';
  bookmarkNeed?: boolean;
  bookmarked: boolean;
  travelNumber: number;
  userProfileType?: boolean;
}

const HorizonBoxLayout = ({
  bookmarked,
  daysLeft,
  title,
  recruits,
  total,
  isBookmark = false,
  location = '',
  userName,
  daysAgo,
  isBar = false,
  showTag = true,
  bookmarkPosition = 'top',
  tags,
  bookmarkNeed = true,
  travelNumber,
  userProfileType = false,
}: HorizonBoxProps) => {
  const tagRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cutTags =
    tags.length >= 2 ? (isBookmark ? tags.slice(0, 1) : tags.slice(0, 2)) : tags;
  const [tagsCount, setTagsCount] = useState(cutTags);

  useEffect(() => {
    if (showTag && tagRef.current) {
      if (tagRef.current.getBoundingClientRect().height >= 24) {
        setTagsCount((prev) => (prev.length > 1 ? prev.slice(0, -1) : []));
      }
    }
  }, [tagRef.current, showTag, tagsCount.length, containerRef?.current?.getBoundingClientRect().width]);

  return (
    <div ref={containerRef} className="w-full flex cursor-pointer items-center">
      <div className="w-full flex-1">
        <div className="flex w-full justify-between items-center">
          <div
            style={{
              marginTop: bookmarkPosition === 'middle' || !bookmarkNeed ? '8px' : 0,
              marginBottom: bookmarkPosition === 'middle' || !bookmarkNeed ? '8px' : 0,
            }}
          >
            {!userProfileType ? (
              <Badge
                height="22px"
                text={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.75 5.49259C11.75 9.31077 6.75 12.5835 6.75 12.5835C6.75 12.5835 1.75 9.31077 1.75 5.49259C1.75 4.19062 2.27678 2.94197 3.21447 2.02134C4.15215 1.1007 5.42392 0.583496 6.75 0.583496C8.07608 0.583496 9.34785 1.1007 10.2855 2.02134C11.2232 2.94197 11.75 4.19062 11.75 5.49259Z" stroke="#3E8D00" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.75 7.0835C7.57843 7.0835 8.25 6.41192 8.25 5.5835C8.25 4.75507 7.57843 4.0835 6.75 4.0835C5.92157 4.0835 5.25 4.75507 5.25 5.5835C5.25 6.41192 5.92157 7.0835 6.75 7.0835Z" stroke="#3E8D00" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>{location}</div>
                  </div>
                }
                backgroundColor="var(--color-keycolor-bg)"
                color="var(--color-keycolor)"
                isDueDate={false}
              />
            ) : null}
          </div>
          {bookmarkPosition === 'top' && bookmarkNeed && (
            <BookmarkButton travelNumber={travelNumber} bookmarked={bookmarked} bookmarkPosition={bookmarkPosition} />
          )}
        </div>

        <div className="pl-1">
          <div className="flex w-full justify-between items-center mb-2">
            <div className="text-base font-semibold mr-2 leading-[19px]">{title}</div>
          </div>
          <div className="flex gap-1 mb-2 text-[var(--color-text-muted)] text-xs text-center leading-[17px] font-normal items-center">
            <div className="text-sm font-normal leading-[17px] text-[var(--color-text-base)]">{userName}</div>
            <div className="text-sm font-medium text-[var(--color-muted3)]">·</div>
            <div className="flex justify-center items-center">
              <PersonIcon stroke="var(--color-text-muted)" />
              <div className="pl-[1.6px]">{recruits}/{total}</div>
            </div>
            <div className="text-sm font-medium text-[var(--color-muted3)]">·</div>
            <div>{daysAgo}</div>
          </div>
        </div>

        {isBar && <div className="mb-2 w-full h-px bg-[var(--color-muted4)]" />}

        {showTag && (
          <div className="flex">
            {userProfileType ? (
              <div className="mr-2">
                <Badge
                  height="22px"
                  text={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.75 5.49259C11.75 9.31077 6.75 12.5835 6.75 12.5835C6.75 12.5835 1.75 9.31077 1.75 5.49259C1.75 4.19062 2.27678 2.94197 3.21447 2.02134C4.15215 1.1007 5.42392 0.583496 6.75 0.583496C8.07608 0.583496 9.34785 1.1007 10.2855 2.02134C11.2232 2.94197 11.75 4.19062 11.75 5.49259Z" stroke="#3E8D00" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.75 7.0835C7.57843 7.0835 8.25 6.41192 8.25 5.5835C8.25 4.75507 7.57843 4.0835 6.75 4.0835C5.92157 4.0835 5.25 4.75507 5.25 5.5835C5.25 6.41192 5.92157 7.0835 6.75 7.0835Z" stroke="#3E8D00" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>{location}</div>
                    </div>
                  }
                  backgroundColor="var(--color-keycolor-bg)"
                  color="var(--color-keycolor)"
                  isDueDate={false}
                />
              </div>
            ) : (
              <BoxLayoutTag
                ref={tagRef}
                text={
                  <div className="flex items-center gap-1">
                    <PlaceIcon height={12} width={10} />
                    <div>{location}</div>
                  </div>
                }
              />
            )}
            {tagsCount.map((text: string, idx) => (
              <BoxLayoutTag key={idx} text={text} />
            ))}
            {tags.length > tagsCount.length ? (
              <BoxLayoutTag
                addStyle={{
                  backgroundColor: 'var(--color-muted4)',
                  padding: '4px 6px',
                  color: 'var(--color-text-muted)',
                  height: '22px',
                  borderRadius: '20px',
                  fontSize: '12px',
                }}
                text={`+${tags.length - tagsCount.length}`}
              />
            ) : null}
          </div>
        )}
      </div>
      {bookmarkPosition === 'middle' && bookmarkNeed && (
        <BookmarkButton travelNumber={travelNumber} bookmarked={bookmarked} bookmarkPosition={bookmarkPosition} />
      )}
    </div>
  );
};

interface BookmarkButtonProps {
  bookmarked: boolean;
  travelNumber: number;
  bookmarkPosition?: 'top' | 'middle';
}

const BookmarkButton = ({ bookmarked, travelNumber, bookmarkPosition }: BookmarkButtonProps) => {
  const { accessToken, userId } = authStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const { postBookmarkMutation, deleteBookmarkMutation } = useUpdateBookmark(
    accessToken!,
    userId!,
    travelNumber
  );
  const pathname = usePathname();

  const bookmarkClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (isGuestUser()) {
      setShowLoginModal(true);
      return;
    }
    if (bookmarked) deleteBookmarkMutation();
    else postBookmarkMutation();
  };

  return (
    <>
      <CheckingModal
        isModalOpen={showLoginModal}
        onClick={() => {
          localStorage.setItem('loginPath', pathname);
          router.push('/login');
        }}
        modalMsg={`로그인 후 이용할 수 있어요.\n로그인 하시겠어요?`}
        modalTitle="로그인 안내"
        modalButtonText="로그인"
        setModalOpen={setShowLoginModal}
      />
      <button
        type="button"
        className="w-8 h-8 flex cursor-pointer items-center justify-center"
        style={{
          marginTop: bookmarkPosition === 'middle' ? '11px' : 0,
          marginBottom: bookmarkPosition === 'middle' ? '4px' : '3px',
        }}
        onClick={bookmarkClickHandler}
        aria-label={bookmarked ? '북마크 제거' : '북마크 추가'}
      >
        {bookmarked ? (
          <FullHeartIcon width={24} height={21.4} />
        ) : (
          <EmptyHeartIcon width={24} height={21.4} stroke="var(--color-muted3)" />
        )}
      </button>
    </>
  );
};

export default HorizonBoxLayout;
