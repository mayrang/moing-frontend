'use client';
import React from 'react';
import SearchFilterTag from '@/shared/ui/tag/SearchFilterTag';

interface CategoryListProps {
  list: string[];
  type: string;
  setType: (type: string) => void;
}

const CategoryList = ({ list, type, setType }: CategoryListProps) => {
  return (
    <div className="flex items-center gap-2 justify-around">
      {list.map((keyword, idx) => (
        <SearchFilterTag
          style={{ cursor: 'pointer' }}
          idx={idx}
          active={keyword === type}
          text={keyword}
          key={keyword}
          onClick={() => setType(keyword)}
        />
      ))}
    </div>
  );
};

export default CategoryList;
