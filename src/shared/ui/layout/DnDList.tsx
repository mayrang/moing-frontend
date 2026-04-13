'use client';
import { SpotType } from '@/model/trip';
import { DragEvent, ForwardedRef, forwardRef, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

const DndItem = (
  {
    idx,
    name,
    region,
    id,
    category,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    handleDragStart,
    handleDelete,
  }: SpotType & {
    idx: number;
    isDragging: boolean;
    handleMouseDown: () => void;
    handleTouchStart: (e: React.TouchEvent) => void;
    handleDragStart: (e: DragEvent) => void;
    handleDelete: () => void;
  },
  ref: ForwardedRef<HTMLLIElement>
) => {
  return (
    <li
      data-id={id}
      draggable={isDragging}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDragStart={handleDragStart}
      ref={ref}
      className={cn(
        'flex items-center justify-between transition-all duration-200 ease-out h-[58px] select-none touch-none',
        isDragging ? 'px-3 rounded-[20px] shadow-[0px_2px_8px_rgba(0,0,0,0.1)]' : 'px-[10px]'
      )}
    >
      <div className="flex gap-6 items-center">
        <div className="flex items-center justify-center text-center w-[18px] rounded-full h-[18px] bg-[var(--color-text-base)] text-white font-semibold text-xs leading-[14px]">
          {idx + 1}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-base font-semibold text-black leading-[19px]">{name}</div>
          <div className="text-xs font-normal text-[var(--color-text-muted)] leading-[14px]">
            {category} {region}
          </div>
        </div>
      </div>
      <div className="flex">
        <div
          className="flex items-center w-[42px] h-[42px] justify-center cursor-move touch-none"
          data-drag-handle
          role="img"
          aria-label="드래그하여 순서 변경"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 6H15" stroke="#ABABAB" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 1H15" stroke="#ABABAB" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 11H15" stroke="#ABABAB" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <button
          type="button"
          aria-label="항목 삭제"
          className="flex items-center w-[42px] h-[42px] justify-center cursor-pointer touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-keycolor)] focus-visible:ring-offset-2 rounded"
          onClick={handleDelete}
        >
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 4H2.55556H15" stroke="#ABABAB" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.4436 4V14.5C13.4436 14.8978 13.2797 15.2794 12.988 15.5607C12.6962 15.842 12.3006 16 11.888 16H4.11024C3.69768 16 3.30202 15.842 3.0103 15.5607C2.71858 15.2794 2.55469 14.8978 2.55469 14.5V4M4.88802 4V2.5C4.88802 2.10218 5.05191 1.72064 5.34363 1.43934C5.63536 1.15804 6.03102 1 6.44358 1H9.55469C9.96725 1 10.3629 1.15804 10.6546 1.43934C10.9464 1.72064 11.1102 2.10218 11.1102 2.5V4" stroke="#ABABAB" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.44531 7.75V12.25" stroke="#ABABAB" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.55469 7.75V12.25" stroke="#ABABAB" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </li>
  );
};

const ForwardedDndItem = forwardRef(DndItem);

const DnDList = ({
  planOrder,
  plans,
  addPlans,
}: {
  planOrder: number;
  plans: { planOrder: number; spots: SpotType[] }[];
  addPlans: (plans: { planOrder: number; spots: SpotType[] }[]) => void;
}) => {
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const containerRef = useRef<HTMLUListElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const currentPlan = plans.find((plan) => plan.planOrder === planOrder);
  if (!currentPlan) return null;
  const spots = currentPlan.spots;

  const updatePlans = (newSpots: SpotType[]) => {
    const updatedPlans = plans.map((plan) =>
      plan.planOrder === planOrder ? { ...plan, spots: newSpots } : plan
    );
    addPlans(updatedPlans);
  };

  const moveItem = (clientY: number) => {
    let targetIndex = -1;
    for (let i = 0; i < itemsRef.current!.length; i++) {
      const sib = itemsRef.current![i];
      if (!sib) continue;
      const rect = sib.getBoundingClientRect();
      const itemMiddle = rect.top + rect.height / 2;
      if (clientY <= itemMiddle) { targetIndex = i; break; }
    }
    if (targetIndex === -1) targetIndex = itemsRef.current!.length;
    const draggingItemIndex = spots.findIndex((item) => item.id === draggingId);
    const draggingItem = spots[draggingItemIndex];
    const updatedSpots = [...spots];
    updatedSpots.splice(draggingItemIndex, 1);
    updatedSpots.splice(targetIndex, 0, draggingItem);
    updatePlans(updatedSpots);
  };

  const handleMouseDown = (id: string) => () => setDraggingId(id);
  const handleDelete = (id: string) => {
    const updatedSpots = spots.filter((spot) => spot.id !== id);
    addPlans(plans.map((plan) => plan.planOrder === planOrder ? { ...plan, spots: updatedSpots } : plan));
  };
  const handleDragStart = (e: DragEvent) => { if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: DragEvent) => { e.preventDefault(); if (!draggingId) return; moveItem(e.clientY); };
  const handleDragEnd = () => setDraggingId(null);
  const handleTouchStart = (id: string) => (e: React.TouchEvent) => {
    setDraggingId(id);
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingId || touchStartY.current === null) return;
    moveItem(e.touches[0].clientY);
    if (containerRef.current) containerRef.current.scrollTop += e.touches[0].clientY - touchStartY.current!;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = () => { setDraggingId(null); touchStartY.current = null; };

  return (
    <ul
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {spots.map((item, i) => (
        <ForwardedDndItem
          {...item}
          idx={i}
          key={item.id}
          handleDelete={() => handleDelete(item!.id as string)}
          isDragging={draggingId === (item!.id as string)}
          handleMouseDown={handleMouseDown(item!.id as string)}
          handleTouchStart={handleTouchStart(item!.id as string)}
          handleDragStart={handleDragStart}
          ref={(r) => { itemsRef.current[i] = r; }}
        />
      ))}
    </ul>
  );
};

export default DnDList;
