"use client";
import { getAvailableTrips, getRecommendationTrips, ITripList } from "@/entities/trip";
import { authStore } from "@/store/client/authStore";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

export const useTripList = (sort: "recommend" | "recent") => {
  const { accessToken, isGuestUser } = authStore();

  const queryKey = sort === "recommend" ? "tripRecommendation" : "availableTrips";
  const { data, isLoading, error, fetchNextPage, refetch, isFetching, hasNextPage } = useInfiniteQuery<
    ITripList,
    Object,
    InfiniteData<ITripList>,
    [_1: string]
  >({
    queryKey: [queryKey],
    enabled: isGuestUser || !!accessToken,
    queryFn: ({ pageParam }) => {
      if (sort === "recent") {
        return getAvailableTrips(pageParam as number, accessToken) as any;
      } else {
        return getRecommendationTrips(pageParam as number, accessToken) as any;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.page?.number + 1 === lastPage?.page?.totalPages) {
        return undefined;
      } else {
        return lastPage?.page?.number + 1;
      }
    },
  });
  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    refetch,
    isFetching,
    hasNextPage,
  };
};
