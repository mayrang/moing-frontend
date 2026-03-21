import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getCommunities } from "@/entities/community";
import { CommunityPage } from "@/page-views/community";
import React from "react";

export default async function Page() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["community", { categoryName: "전체", sortingTypeName: "최신순", keyword: "" }, false],
    queryFn: ({ pageParam }) =>
      getCommunities(null, {
        sortingTypeName: "최신순",
        keyword: "",
        categoryName: "전체",
        page: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.page?.number + 1 === lastPage?.page?.totalPages) {
        return undefined;
      }
      return lastPage?.page?.number + 1;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommunityPage />
    </HydrationBoundary>
  );
}
