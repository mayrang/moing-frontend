'use client';
import RoundedImage from '@/shared/ui/profile/RoundedImage';
import { myPageStore } from '@/store/client/myPageStore';
import BoxLayoutTag from '@/shared/ui/tag/BoxLayoutTag';

const ApplyTripProfile = () => {
  const { name, agegroup, profileUrl } = myPageStore();
  return (
    <div className="flex items-center gap-2">
      <RoundedImage src={profileUrl ?? ''} size={48} />
      <div className="flex items-center gap-1">
        <div className="text-lg font-semibold leading-[21.48px]">{name}</div>
        <BoxLayoutTag
          text={agegroup}
          addStyle={{
            color: 'var(--color-keycolor)',
            backgroundColor: 'var(--color-keycolor-bg)',
            height: '22px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
          }}
        />
      </div>
    </div>
  );
};

export default ApplyTripProfile;
