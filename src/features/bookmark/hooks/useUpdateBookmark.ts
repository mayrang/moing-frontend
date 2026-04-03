"use client";
import { deleteBookmark, postBookmark } from "@/entities/bookmark";
import { createMutationOptions } from "@/shared/lib/errors";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const BOOKMARK_QUERIES = [
  "bookmarks", "search", "myTrips", "myApplyTrips",
  "tripRecommendation", "availableTrips", "myRequestedTrips",
] as const;

export function useUpdateBookmark(accessToken: string, userId: number, travelNumber: number) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    BOOKMARK_QUERIES.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    queryClient.invalidateQueries({ queryKey: ["tripDetail", travelNumber] });
  };

  const { mutateAsync: postBookmarkMutation, isSuccess: isBookmarkPostSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: () => postBookmark(accessToken, userId, travelNumber),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: invalidateAll,
  });

  const { mutateAsync: deleteBookmarkMutation, isSuccess: isBookmarkDeleteSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: () => deleteBookmark(accessToken, travelNumber),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: invalidateAll,
  });

  return {
    postBookmarkMutation,
    deleteBookmarkMutation,
    isBookmarkDeleteSuccess,
    isBookmarkPostSuccess,
  };
}
