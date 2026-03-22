'use client';
import ButtonContainer from '@/shared/ui/layout/ButtonContainer';
import Button from '@/shared/ui/button/Button';
import InputField from '@/shared/ui/input/InputField';
import Spacing from '@/shared/ui/layout/Spacing';
import { useEffect, useState } from 'react';
import RelationKeywordList from '@/features/search/ui/RelationKeywordList';
import PlaceIcon from '@/components/icons/PlaceIcon';

const TripRegion = ({
  nextFunc,
  addLocationName,
  initLocationName,
  isDetail = false,
}: {
  initLocationName: {
    locationName: string;
    mapType: 'google' | 'kakao';
    countryName: string;
  };
  addLocationName: ({
    locationName,
    mapType,
    countryName,
  }: {
    locationName: string;
    mapType: 'google' | 'kakao';
    countryName: string;
  }) => void;
  nextFunc: () => void;
  isDetail?: boolean;
}) => {
  const [keyword, setKeyword] = useState(initLocationName.locationName);
  const [showRelationList, setShowRelationList] = useState(true);
  const [isLoad, setIsLoad] = useState(false);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;

    const handleLoad = () => {
      window.kakao.maps.load(() => {
        setIsLoad(true);
      });
    };

    script.addEventListener('load', handleLoad);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!submit || !isLoad) return;
    const handleLoad = () => {
      window.kakao.maps.load(() => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(keyword, (result: unknown, status: string) => {
          if (status === window.kakao.maps.services.Status.OK) {
            addLocationName({
              locationName: keyword,
              mapType: 'kakao',
              countryName: '대한민국',
            });
          } else {
            addLocationName({
              locationName: keyword,
              mapType: 'google',
              countryName: '',
            });
          }
        });
        setSubmit(false);
        nextFunc();
      });
    };

    handleLoad();
  }, [submit, isLoad, keyword, setSubmit, nextFunc]);

  const changeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    if (!showRelationList) {
      setShowRelationList(true);
    }
  };

  const clickRelationKeyword = (kw: string) => {
    setKeyword(kw);
    setShowRelationList(false);
  };

  const handleRemoveValue = () => setKeyword('');

  const handleNext = () => {
    if (!isLoad) return;
    setSubmit(true);
  };

  return (
    <>
      <h2 className="text-xl font-semibold leading-[28px] ml-[6px] text-left">
        어디로 떠나볼까요?
      </h2>
      <Spacing size={8} />
      <InputField
        value={keyword}
        placeholder="여행지를 입력하세요."
        handleRemoveValue={handleRemoveValue}
        onChange={changeKeyword}
        icon={<PlaceIcon />}
      />
      {keyword.length > 0 && (
        <>
          {showRelationList && (
            <>
              <Spacing size={16} />
              <RelationKeywordList onClick={clickRelationKeyword} keyword={keyword} />
            </>
          )}
        </>
      )}
      <ButtonContainer>
        <Button
          onClick={handleNext}
          disabled={keyword === ''}
          addStyle={
            keyword === ''
              ? {
                  backgroundColor: 'rgba(220, 220, 220, 1)',
                  color: 'rgba(132, 132, 132, 1)',
                  boxShadow: '-2px 4px 5px 0px rgba(170, 170, 170, 0.1)',
                }
              : undefined
          }
          text="다음"
        />
      </ButtonContainer>
    </>
  );
};

export default TripRegion;
