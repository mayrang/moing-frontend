'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface DropdownProps {
  list: number[];
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

const Dropdown = ({ list, value, setValue }: DropdownProps) => {
  const [active, setActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const close = () => {
    setActive(false);
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActive(true);
      const currentIndex = Math.max(list.indexOf(value), 0);
      setTimeout(() => optionRefs.current[currentIndex]?.focus(), 0);
    } else if (e.key === 'Escape') {
      setActive(false);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(index + 1, list.length - 1);
      optionRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        setActive(false);
        buttonRef.current?.focus();
      } else {
        optionRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setValue(list[index]);
      close();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  return (
    <div className="relative w-[150px] h-[3.6rem] rounded-lg bg-white cursor-pointer">
      <div
        className={[
          'transition-[height] duration-200 ease-in-out rounded-[30px] border border-[rgba(205,205,205,1)]',
          'w-[150px] pl-5 bg-white pr-[19px]',
          active
            ? 'max-[777px]:h-[160px] min-[777px]:h-[300px]'
            : 'h-[52px]',
        ].join(' ')}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={active}
          aria-haspopup="listbox"
          className="w-full h-[52px] border-none cursor-pointer flex box-border justify-between items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-keycolor)] focus-visible:ring-inset rounded-[30px]"
          onClick={() => setActive(!active)}
          onKeyDown={handleButtonKeyDown}
        >
          {value}
          {active ? (
            <Image src="/images/dropDownUp.png" width={16} height={16} alt="" />
          ) : (
            <Image src="/images/dropDown.png" width={16} height={16} alt="" />
          )}
        </button>
        <ul
          role="listbox"
          aria-label="선택"
          className={[
            'absolute top-[2.6rem] list-none w-[119px] rounded-lg bg-white',
            'transition-[height] duration-200 ease-in-out overflow-y-scroll',
            '[&::-webkit-scrollbar]:w-[3px]',
            '[&::-webkit-scrollbar-track]:bg-transparent',
            '[&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:h-20 [&::-webkit-scrollbar-thumb]:bg-[rgba(217,217,217,1)]',
            '[&::-webkit-scrollbar-button]:w-0 [&::-webkit-scrollbar-button]:h-0',
            active
              ? 'max-[777px]:h-[100px] min-[777px]:h-[241px]'
              : 'h-0',
          ].join(' ')}
        >
          {list.map((element: number, index: number) => (
            <li
              key={element}
              ref={(el) => { optionRefs.current[index] = el; }}
              role="option"
              aria-selected={element === value}
              tabIndex={active ? 0 : -1}
              className="py-[10px] transition-[0.3s] text-base font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-keycolor)]"
              onClick={() => {
                setValue(element);
                close();
              }}
              onKeyDown={(e) => handleOptionKeyDown(e, index)}
            >
              {element}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dropdown;
