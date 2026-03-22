'use client';
import Badge from '@/shared/ui/badge/Badge';
import RoundedImage from '@/shared/ui/profile/RoundedImage';
import { daysAgoFormatted } from '@/utils/time';
import DetailImages from './DetailImages';
import SearchFilterTag from '@/shared/ui/tag/SearchFilterTag';
import CommunityHeartIcon from '@/components/icons/CommunityHeartIcon';
import useCommunity from '@/hooks/useCommunity';
import ResultToast from '@/shared/ui/toast/ResultToast';
import { editStore } from '@/store/client/editStore';
import { COMMUNITY_TOAST_MESSAGES } from '@/constants/toastMessages';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { isGuestUser } from '@/utils/user';
import { useState } from 'react';
import CheckingModal from '@/shared/ui/modal/CheckingModal';
import { useBackPathStore } from '@/store/client/backPathStore';
import { userProfileOverlayStore } from '@/store/client/userProfileOverlayStore';

const CommunityPost = () => {
  const params = useParams();
  const { setProfileShow, setUserProfileUserId } = userProfileOverlayStore();
  const communityNumber = params?.communityNumber as string;
  const { editToastShow, setEditToastShow } = editStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const {
    community: { data, isLoading },
    images,
    like,
    unlike,
  } = useCommunity(Number(communityNumber));

  if (isLoading || !data) return <></>;

  const handleLikeToggle = () => {
    if (isGuestUser()) { setShowLoginModal(true); return; }
    if (data.liked) unlike({ communityNumber: Number(communityNumber) });
    else like({ communityNumber: Number(communityNumber) });
  };

  const moveToUserProfilePage = (userNumber: number) => {
    setUserProfileUserId(userNumber);
    setProfileShow(true);
  };

  return (
    <>
      <CheckingModal
        isModalOpen={showLoginModal}
        onClick={() => { localStorage.setItem('loginPath', pathname); router.push('/login'); }}
        modalMsg={`로그인 후 이용할 수 있어요.\n로그인 하시겠어요?`}
        modalTitle="로그인 안내"
        modalButtonText="로그인"
        setModalOpen={setShowLoginModal}
      />
      <div className="bg-[var(--color-bg)] px-6 py-6 mb-[6px] top-[100px] left-6 gap-8 rounded-[20px] shadow-[0px_2px_6px_3px_rgba(170,170,170,0.18)]">
        <ResultToast
          height={120}
          isShow={editToastShow}
          setIsShow={setEditToastShow}
          text={COMMUNITY_TOAST_MESSAGES.editPost}
        />
        <div>
          <div className="flex">
            <Badge
              isDueDate={false}
              text={data.categoryName}
              height="22px"
              backgroundColor="var(--color-muted4)"
              color="var(--color-text-muted)"
              fontWeight="600"
            />
          </div>
          <div
            className="mt-4 flex items-center cursor-pointer"
            onClick={() => moveToUserProfilePage(data.userNumber)}
          >
            <RoundedImage src={data.profileImageUrl} size={40} />
            <div className="ml-2">
              <div className="text-base font-semibold leading-[19.09px] text-[var(--color-text-base)] mb-1">
                {data.postWriter}
              </div>
              <div className="font-normal text-sm leading-[16.71px] text-[var(--color-text-muted)]">
                {daysAgoFormatted(data?.regDate)}
              </div>
            </div>
          </div>
          <div className="mt-[3.8svh] text-xl font-semibold text-left">{data.title}</div>
          <div className="mt-[1.9svh] whitespace-pre-line text-base font-normal leading-[22.4px] text-[var(--color-text-base)]">
            {data.content}
          </div>
          {!isLoading && images.data && images.data.length > 0 && (
            <div className="mt-[3.8svh]">
              <DetailImages images={images.data} />
            </div>
          )}
          {data && (
            <div className="my-[3.8svh] cursor-pointer" onClick={handleLikeToggle}>
              <SearchFilterTag
                addStyle={{
                  padding: '11px 16px',
                  fontSize: '14px',
                  lineHeight: '20px',
                  backgroundColor: data.liked ? 'var(--color-keycolor-bg)' : 'var(--color-search-bg)',
                  color: data.liked ? 'var(--color-keycolor)' : 'var(--color-text-muted)',
                  border: data.liked ? '1px solid var(--color-keycolor)' : '1px solid var(--color-muted3)',
                  borderRadius: '30px',
                  fontWeight: '400',
                }}
                icon={<CommunityHeartIcon />}
                text={data.likeCount > 0 ? `${data.likeCount}` : '좋아요'}
                idx={0}
              />
            </div>
          )}
        </div>
        <div className="mt-8 border-t border-[var(--color-muted4)] pt-4 flex text-xs font-normal leading-[14.32px] text-[var(--color-text-muted2)]">
          <div>댓글 {data.commentCount}</div>
          <div className="mx-1"> · </div>
          <div>좋아요 {data.likeCount}</div>
          <div className="mx-1"> · </div>
          <div>조회수 {data.viewCount}</div>
        </div>
      </div>
    </>
  );
};

export default CommunityPost;
