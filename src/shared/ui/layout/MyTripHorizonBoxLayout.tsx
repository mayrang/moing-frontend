'use client';
import Badge from '@/shared/ui/badge/Badge';
import PersonIcon from '@/components/icons/PersonIcon';
import BoxLayoutTag from '@/shared/ui/tag/BoxLayoutTag';
import PlaceIcon from '@/components/icons/PlaceIcon';
import { authStore } from '@/store/client/authStore';

interface HorizonBoxProps {
  travelNumber: number;
  daysLeft: number;
  title: string;
  recruits: number;
  total: number;
  location?: string;
  userName: string;
  daysAgo: string;
  imgSrc?: string;
  tags: string[];
  bookmarked: boolean;
  bookmarkTabActive?: boolean;
}

const MyTripHorizonBoxLayout = ({
  travelNumber,
  daysLeft,
  title,
  recruits,
  total,
  location = '',
  userName,
  daysAgo,
  tags,
  bookmarked,
  bookmarkTabActive = false,
}: HorizonBoxProps) => {
  const { accessToken, userId } = authStore();
  const cutTags = tags.length > 2 ? tags.slice(0, 2) : tags;

  return (
    <div className="w-full flex justify-between">
      <div className="w-full">
        <div className="flex justify-between items-center py-[5px]">
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

        <div>
          <div className="mt-2 flex items-center mb-2">
            <div className="text-base font-semibold leading-[19.09px]">{title}</div>
          </div>
          <div
            className="flex gap-1 mb-2 items-center justify-start border-b border-[var(--color-muted4)] pb-2"
          >
            <div className="text-sm font-medium text-[var(--color-text-base)]">{userName}</div>
            <div className="font-medium text-sm text-[var(--color-muted3)]">·</div>
            <PersonIcon width={11} height={14} stroke="var(--color-text-muted)" />
            <div className="font-normal text-xs text-[var(--color-text-muted)] pl-[1.6px] leading-[14.32px]">
              {recruits}/{total}
            </div>
            <div className="font-medium text-sm text-[var(--color-muted3)]">·</div>
            <div className="text-xs font-normal leading-[14.32px] text-[var(--color-text-muted)]">
              {daysAgo}
            </div>
          </div>
        </div>

        <div className="flex">
          <BoxLayoutTag
            text={
              <div className="flex items-center gap-1">
                <PlaceIcon height={12} width={10} />
                <div>{location}</div>
              </div>
            }
          />
          {cutTags.map((text: string, idx) => (
            <BoxLayoutTag key={idx} text={text} />
          ))}
          {tags.length > cutTags.length ? (
            <BoxLayoutTag
              addStyle={{
                backgroundColor: 'var(--color-muted4)',
                padding: '4px 6px',
                color: 'var(--color-text-muted)',
                height: '22px',
                borderRadius: '20px',
                fontSize: '12px',
              }}
              text={`+${tags.length - cutTags.length}`}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MyTripHorizonBoxLayout;
