'use client';

import { useEffect, useState } from 'react';
import SelectArrow from '@/shared/ui/icons/SelectArrow';

interface SelectProps {
  id?: string;
  list: string[];
  setValue: (element: string) => void;
  value?: string | number;
  initOpen?: boolean;
  noneValue?: string;
  width?: 'fit-content' | '100%';
  /** 트리거 버튼 접근성 이름 (스크린리더용). 예: "여행 지역 선택" */
  'aria-label'?: string;
}

/**
 * 드롭다운 Select 컴포넌트.
 * 아이템별 staggered 애니메이션(200ms 간격)을 유지.
 * 복잡한 스크롤바 스타일은 globals.css의 .select-scrollbar 클래스로 분리.
 */
const Select = ({
  list,
  id,
  width = 'fit-content',
  value,
  initOpen = false,
  setValue,
  noneValue,
  'aria-label': ariaLabel,
}: SelectProps) => {
  const [active, setActive] = useState(initOpen);
  const [animatedItems, setAnimatedItems] = useState<boolean[]>([]);

  const changeValue = (element: string) => {
    setValue(element);
    setActive(false);
  };

  useEffect(() => {
    if (active) {
      const timers: NodeJS.Timeout[] = [];
      const newAnimatedItems = Array(list.length).fill(false);
      list.forEach((_, index) => {
        timers.push(
          setTimeout(() => {
            newAnimatedItems[index] = true;
            setAnimatedItems([...newAnimatedItems]);
          }, index * 200)
        );
      });
      return () => timers.forEach(clearTimeout);
    } else {
      setAnimatedItems(Array(list.length).fill(false));
    }
  }, [active, list]);

  return (
    <div id={id}>
      {active && (
        <div
          onClick={(e) => { e.preventDefault(); setActive(false); }}
          className={[
            'pointer-events-auto fixed inset-0 z-1001 bg-[rgba(26,26,26,0.3)] opacity-80',
            'transition-all duration-200 ease-in-out',
            'min-[440px]:left-1/2 min-[440px]:h-svh min-[440px]:w-97.5 min-[440px]:-translate-x-1/2 min-[440px]:overflow-x-hidden',
          ].join(' ')}
        />
      )}
      <div
        className="relative z-1002 h-auto cursor-pointer rounded-[20px] bg-bg [&::-webkit-scrollbar]:hidden"
        style={{ width }}
      >
        <div
          className={[
            'relative z-3 h-max rounded-[20px] bg-white [&::-webkit-scrollbar]:hidden',
            active
              ? 'rounded-bl-none rounded-br-none border-none max-h-40 min-[777px]:max-h-75'
              : 'border border-muted3 max-h-10 overflow-hidden',
            'min-h-11',
          ].join(' ')}
        >
          {/* Label */}
          <button
            role="combobox"
            aria-expanded={active}
            aria-haspopup="listbox"
            aria-label={ariaLabel}
            className="box-border flex min-h-11 min-w-23.75 w-full cursor-pointer items-center justify-between gap-2.5 border-none px-4 py-3 text-sm font-normal text-text-muted outline-none"
            onClick={() => setActive(!active)}
          >
            {value
              ? <span className="text-text-base">{value}</span>
              : <span className="text-text-muted">{noneValue}</span>
            }
            <span
              aria-hidden="true"
              className="transition-transform duration-200"
              style={{ transform: active ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <SelectArrow />
            </span>
          </button>

          {/* Option List */}
          <ul
            role="listbox"
            aria-label="선택 목록"
            className={[
              'select-scrollbar absolute left-0 right-0 top-10.75 z-5 w-full list-none',
              'rounded-[20px] rounded-tl-none rounded-tr-none bg-bg pb-1',
              'overflow-y-auto text-base font-normal leading-5',
              'transition-[max-height] duration-200 ease-in-out',
              active ? 'max-h-42.5' : 'max-h-0',
            ].join(' ')}
          >
            {list.map((element, index) => (
              <li
                key={element}
                role="option"
                aria-selected={value === element}
                onClick={() => changeValue(element)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); changeValue(element); } }}
                tabIndex={0}
                className={[
                  'px-4 py-2.5 text-sm font-medium cursor-pointer',
                  'hover:bg-keycolor-bg',
                  'transition-[opacity,transform] duration-150',
                  animatedItems[index] ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                ].join(' ')}
                style={{ transitionTimingFunction: 'cubic-bezier(0.25, 1.5, 0.5, 1)' }}
              >
                {element}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Select;
