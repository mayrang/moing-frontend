import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getAvailableTrips, getRecommendationTrips } from "@/entities/trip";
import TripList from "@/page/TripList/TripList";

const getNextPageParam = (lastPage: any) => {
  if (lastPage?.page?.number + 1 === lastPage?.page?.totalPages) {
    return undefined;
  }
  return lastPage?.page?.number + 1;
};

export default async function Page() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: ["availableTrips"],
      queryFn: ({ pageParam }) => getAvailableTrips(pageParam as number, null),
      initialPageParam: 0,
      getNextPageParam,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: ["tripRecommendation"],
      queryFn: ({ pageParam }) => getRecommendationTrips(pageParam as number, null),
      initialPageParam: 0,
      getNextPageParam,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TripList />
    </HydrationBoundary>
  );
}
