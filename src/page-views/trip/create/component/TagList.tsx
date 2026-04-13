"use client";
import SearchFilterTag from "@/components/designSystem/tag/SearchFilterTag";
import { TAG_LIST } from "@/constants/tags";
import React from "react";

interface TagListProps {
  taggedArray: string[];
  clickTag: (index: number) => void;
}

const TagList = ({ taggedArray, clickTag }: TagListProps) => {
  const isActive = (index: number) => {
    return taggedArray.includes(TAG_LIST.value[index]);
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        {TAG_LIST.tags?.map((tag, idx) => (
          <SearchFilterTag
            key={tag}
            idx={idx}
            addStyle={{
              backgroundColor: isActive(idx)
                ? "rgba(227, 239, 217, 1)"
                : "rgba(240, 240, 240, 1)",
              color: isActive(idx)
                ? "var(--color-keycolor)"
                : "rgba(52, 52, 52, 1)",
              border: isActive(idx)
                ? "1px solid var(--color-keycolor)"
                : "1px solid var(--color-search-bg)",
              borderRadius: "30px",
              padding: "10px 20px",
              fontWeight: isActive(idx) ? "600" : "400",
              lineHeight: "22px",
              cursor: "pointer",
            }}
            text={tag}
            onClick={() => clickTag(idx)}
          />
        ))}
      </div>
    </>
  );
};

export default TagList;
