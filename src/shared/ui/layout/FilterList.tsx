'use client';
import React, { useState, MouseEvent } from 'react';
import SelectArrow from '@/components/icons/SelectArrow';
import Accordion from './Accordion';
import BottomModal from './BottomModal';
import SearchFilterTag from '@/shared/ui/tag/SearchFilterTag';
import { IGender, IPeople, IPeriod, IPlace, IStyle, searchStore } from '@/store/client/searchStore';
import useSearch from '@/hooks/search/useSearch';
import WhiteXIcon from '@/components/icons/WhiteXIcon';
import FilterButton from '@/shared/ui/button/FilterButton';
import { useSearchParams } from 'next/navigation';

const FILTER_LIST = [
  { title: '장소', tags: ['국내', '해외'] as const },
  { title: '성별', tags: ['모두', '여자만', '남자만'] as const },
  { title: '인원', tags: ['2명', '3~4명', '5명 이상'] as const },
  { title: '기간', tags: ['일주일 이하', '1~2주', '3~4주', '한달 이상'] as const },
  { title: '스타일', tags: ['힐링', '즉흥적', '계획적인', '액티비티', '먹방', '예술', '핫플', '쇼핑', '가성비', '역사', '자연'] as const },
] as const;

const FilterList = () => {
  const [showModal, setShowModal] = useState(false);
  const [initialChecked, setInitialChecked] = useState({
    장소: false, 인원: false, 기간: false, 스타일: false, 성별: false,
  });
  const { setFilter, place, people, period, style, setReset, gender, setOneFilterReset } = searchStore();
  const searchParams = useSearchParams();
  const keyword = searchParams?.get('keyword') ?? '';
  const { refetch } = useSearch({ keyword });

  const getCount = (type: '장소' | '인원' | '기간' | '스타일' | '성별') => {
    if (type === '장소') return place.length;
    if (type === '인원') return people.length;
    if (type === '기간') return period.length;
    if (type === '스타일') return style.length;
    if (type === '성별') return gender.length;
    return 0;
  };

  const isActive = (type: '장소' | '인원' | '기간' | '스타일' | '성별', value: IPeople | IPeriod | IStyle | IPlace | IGender) => {
    if (type === '장소') return place?.includes(value as IPlace);
    if (type === '인원') return people?.includes(value as IPeople);
    if (type === '기간') return period?.includes(value as IPeriod);
    if (type === '스타일') return style?.includes(value as IStyle);
    if (type === '성별') return gender?.includes(value as IGender);
    return false;
  };

  const handleShowModal = (e: MouseEvent, title: '장소' | '인원' | '기간' | '스타일' | '성별') => {
    e.stopPropagation();
    setShowModal(true);
    setInitialChecked((prev) => ({ ...prev, [title]: true }));
  };

  const handleCloseModal = () => {
    setInitialChecked({ 기간: false, 스타일: false, 인원: false, 장소: false, 성별: false });
    setShowModal(false);
  };

  const handleOneFilterReset = (e: MouseEvent, type: '장소' | '인원' | '기간' | '스타일' | '성별') => {
    e.stopPropagation();
    setOneFilterReset(type);
  };

  const clickTag = (type: '장소' | '인원' | '기간' | '스타일' | '성별', value: IPeople | IPeriod | IStyle | IPlace | IGender) => {
    if (type === '장소') setFilter(type, [value] as IPlace[]);
    else if (type === '인원') setFilter(type, [value.trim()] as IPeople[]);
    else if (type === '기간') setFilter(type, [value] as IPeriod[]);
    else if (type === '스타일') setFilter(type, [value] as IStyle[]);
    else if (type === '성별') setFilter(type, [value] as IGender[]);
  };

  const getAllFilterCount = () => place.length + period.length + style.length + people.length + gender.length;

  const getFirstTag = (type: '장소' | '인원' | '기간' | '스타일' | '성별') => {
    if (type === '장소') return place[0];
    if (type === '인원') return people[0];
    if (type === '기간') return period[0];
    if (type === '스타일') return style[0];
    if (type === '성별') return gender[0];
  };

  return (
    <>
      {showModal && (
        <BottomModal initialHeight={75} closeModal={handleCloseModal}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-y-auto px-5 pb-[13svh]">
              {FILTER_LIST.map((item) => (
                <Accordion
                  count={getCount(item.title)}
                  id={item.title}
                  title={item.title}
                  initialChecked={initialChecked[item.title]}
                  key={item.title}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    {item.tags?.map((tag, idx) => (
                      <SearchFilterTag
                        key={tag}
                        idx={idx}
                        addStyle={{
                          backgroundColor: isActive(item.title, tag) ? 'rgba(227, 239, 217, 1)' : 'rgba(240, 240, 240, 1)',
                          color: isActive(item.title, tag) ? 'var(--color-keycolor)' : 'rgba(52, 52, 52, 1)',
                          border: isActive(item.title, tag) ? `1px solid var(--color-keycolor)` : `1px solid var(--color-search-bg)`,
                        }}
                        text={tag}
                        onClick={() => clickTag(item.title, tag)}
                      />
                    ))}
                  </div>
                </Accordion>
              ))}
              <div className="left-0 bottom-0 absolute px-6 bg-white pb-[4.2svh] w-full">
                <FilterButton
                  initializeOnClick={() => setReset()}
                  onClick={() => { setShowModal(false); refetch(); }}
                  style={getAllFilterCount() === 0 ? { backgroundColor: 'rgba(220, 220, 220, 1)', color: 'var(--color-text-muted)' } : undefined}
                  disabled={getAllFilterCount() === 0}
                  text={getAllFilterCount() === 0 ? '필터 검색' : `${getAllFilterCount()}개 필터 검색`}
                />
              </div>
            </div>
          </div>
        </BottomModal>
      )}
      <div className="flex relative overflow-x-scroll [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-[3px] w-full items-center gap-[9px]">
        {FILTER_LIST.map((filter, idx) => (
          <SearchFilterTag
            idx={idx}
            text={
              getCount(filter.title) === 0
                ? filter.title
                : getCount(filter.title) === 1
                  ? (getFirstTag(filter.title) ?? filter.title)
                  : `${filter.title} ${getCount(filter.title)}`
            }
            iconPosition="end"
            active={getCount(filter.title) > 0}
            onClick={(e) => handleShowModal(e, filter.title)}
            addStyle={{
              backgroundColor: getCount(filter.title) > 0 ? 'var(--color-keycolor)' : 'white',
              color: getCount(filter.title) > 0 ? 'white' : 'black',
              border: '1px solid #ababab',
              borderRadius: '15px',
              padding: '8px 14px',
              fontWeight: '600',
              fontSize: '14px',
            }}
            icon={
              getCount(filter.title) > 0 ? (
                <button type="button" onClick={(e) => handleOneFilterReset(e, filter.title)}>
                  <WhiteXIcon size={9} />
                </button>
              ) : (
                <SelectArrow />
              )
            }
          />
        ))}
      </div>
    </>
  );
};

export default FilterList;
