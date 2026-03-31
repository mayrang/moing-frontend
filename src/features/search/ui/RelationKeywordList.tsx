"use client";
import useRelationKeyword from "../hooks/useRelationKeyword";
import RelationKeyword from "./RelationKeyword";

interface RelationKeywordListProps {
  keyword: string;
  onClick: (keyword: string) => void;
}

const RelationKeywordList = ({
  keyword,
  onClick,
}: RelationKeywordListProps) => {
  const { data, isLoading, error } = useRelationKeyword(keyword);

  if (isLoading) {
    return null;
  }
  if (error) {
    return null;
  }

  return (
    <div>
      {data &&
        data?.suggestions?.length > 0 &&
        data?.suggestions?.map((data) => (
          <button
            type="button"
            className="block cursor-pointer"
            key={data}
            onClick={() => onClick(data)}
          >
            <RelationKeyword keyword={keyword} data={data} />
          </button>
        ))}
    </div>
  );
};

export default RelationKeywordList;
