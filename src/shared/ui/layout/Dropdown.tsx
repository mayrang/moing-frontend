'use client';
import Image from 'next/image';
import { useState } from 'react';

interface DropdownProps {
  list: number[];
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
}

const Dropdown = ({ list, value, setValue }: DropdownProps) => {
  const [active, setActive] = useState(false);

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
          type="button"
          className="w-full h-[52px] border-none cursor-pointer flex box-border justify-between items-center"
          onClick={() => setActive(!active)}
        >
          {value}
          {active ? (
            <Image src="/images/dropDownUp.png" width={16} height={16} alt="" />
          ) : (
            <Image src="/images/dropDown.png" width={16} height={16} alt="" />
          )}
        </button>
        <ul
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
          {list.map((element: number) => (
            <li
              key={element}
              className="py-[10px] transition-[0.3s] text-base font-medium cursor-pointer"
              onClick={() => {
                setActive(false);
                setValue(element);
              }}
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
