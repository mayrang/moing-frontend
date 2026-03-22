"use client";
import FilterList from "@/components/FilterList";
import RecommendKeyword from "@/components/RecommendKeyword";
import SearchFilterTag from "@/components/designSystem/tag/SearchFilterTag";
import SearchResultList from "@/components/SearchResultList";
import Spacing from "@/components/Spacing";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useSearch from "@/hooks/search/useSearch";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import RelationKeywordList from "@/components/relationKeyword/RelationKeywordList";
import InputField from "@/components/designSystem/input/InputField";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authStore } from "@/store/client/authStore";

const RECOMMEND_TAGS1 = ["유럽", "강릉", "제주"];
const RECOMMEND_TAGS2 = ["호주", "미국"];

const SearchTravel = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const keywordParams = searchParams?.get("keyword") ?? "";
  const [keyword, setKeyword] = useState(keywordParams);
  const [finalKeyword, setFinalKeyword] = useState(keywordParams);
  const [bookmarked, setBookmarked] = useState(false);
  const { accessToken } = authStore();
  const [showRelationKeyword, setShowRelationKeyword] = useState(true);
  const [ref, inView] = useInView();
  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetching } =
    useSearch({
      keyword: finalKeyword,
    });

  useEffect(() => {
    if (bookmarked) {
      refetch();
      setBookmarked(false);
    }
  }, [bookmarked]);

  useEffect(() => {
    if (accessToken) {
      refetch();
    }
  }, [accessToken]);

  useInfiniteScroll(() => {
    if (inView) {
      !isFetching && hasNextPage && fetchNextPage();
    }
  }, [inView, !isFetching, fetchNextPage, hasNextPage]);
  useEffect(() => {
    if (finalKeyword !== "") {
      refetch();

      const params = new URLSearchParams(searchParams?.toString());
      params.set("keyword", finalKeyword);

      router.push(`${pathname}?${params.toString()}`);
    }
  }, [finalKeyword, refetch]);

  useEffect(() => {
    if (finalKeyword !== "" && data && finalKeyword !== keyword) {
      setShowRelationKeyword(true);
      setFinalKeyword("");
    }
  }, [finalKeyword, JSON.stringify(data), keyword]);

  const handleRemoveValue = () => {
    setKeyword("");
  };

  const changeKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleRecommendKeyword = (keyword: string) => {
    setKeyword(keyword);
    setFinalKeyword(keyword);
    refetch();
  };

  const onClickRelationKeyword = (keyword: string) => {
    setKeyword(keyword);
    setFinalKeyword(keyword);
    setShowRelationKeyword(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keyword.trim() !== "") {
      e.preventDefault();
      setFinalKeyword(keyword.trim());
    }
  };

  return (
    <div className="px-6">
      <InputField
        value={keyword}
        onChange={changeKeyword}
        onKeyDown={handleKeyDown}
        placeholder="어디로 여행을 떠날까요?"
        handleRemoveValue={handleRemoveValue}
      />
      <Spacing size={16} />
      <FilterList />

      {typeof data !== "undefined" ? (
        <>
          {isLoading && <div>검색 중...</div>}
          {!isLoading && data && (
            <>
              <SearchResultList
                setBookmarked={setBookmarked}
                key={JSON.stringify(data)}
                searchResult={data.pages}
              />
              <div ref={ref} style={{ height: 20 }} />
            </>
          )}
          {!isLoading && data?.pages[0].content.length === 0 && (
            <>
              <div className="flex flex-col items-center">
                <Spacing size={"12.3svh"} />
                <img
                  alt="검색 결과가 없습니다"
                  width={80}
                  height={80}
                  src={"/images/noData.png"}
                />
                <Spacing size={16} />
                <div className="text-base font-medium leading-[22.4px] tracking-[-0.025em] text-center">
                  원하시는 검색 결과가 없어요.
                  <br />
                  이런 검색어는 어떠세요?
                </div>
                <Spacing size={24} />
                <div className="flex items-center gap-4">
                  {RECOMMEND_TAGS1.map((keyword, idx) => (
                    <SearchFilterTag
                      idx={idx}
                      text={keyword}
                      key={keyword}
                      onClick={() => handleRecommendKeyword(keyword)}
                    />
                  ))}
                </div>
                <Spacing size={18} />
                <div className="flex items-center gap-4">
                  {RECOMMEND_TAGS2.map((keyword, idx) => (
                    <SearchFilterTag
                      idx={idx}
                      text={keyword}
                      key={keyword}
                      onClick={() => handleRecommendKeyword(keyword)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {keyword.length > 0 ? (
            <>
              {showRelationKeyword && (
                <>
                  <Spacing size={29} />
                  <RelationKeywordList
                    onClick={onClickRelationKeyword}
                    keyword={keyword}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Spacing size={25} />
              <RecommendKeyword setKeyword={handleRecommendKeyword} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchTravel;
