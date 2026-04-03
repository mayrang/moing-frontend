"use client";
import { deleteComment, getComments, likeComment, postComment, unlikeComment, updateComment, ICommentList, ICommentPost } from "@/entities/comment";
import { createMutationOptions } from "@/shared/lib/errors";
import { authStore } from "@/store/client/authStore";
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const useComment = (relatedType: "travel" | "community", relatedNumber: number) => {
  const { userId, accessToken, isGuestUser } = authStore();

  const commentList = useInfiniteQuery<
    ICommentList,
    Object,
    InfiniteData<ICommentList>,
    [_1: string, _2: string, _3: number]
  >({
    queryKey: ["comments", relatedType, relatedNumber],

    queryFn: ({ pageParam }) => {
      return getComments(relatedType, relatedNumber, accessToken, pageParam as number) as any;
    },
    initialPageParam: 0,
    enabled: isGuestUser || !!accessToken,
    getNextPageParam: (lastPage) => {
      if (lastPage?.page?.totalPages === 0) {
        return undefined;
      }
      if (lastPage?.page?.number + 1 === lastPage?.page?.totalPages) {
        return undefined;
      } else {
        return lastPage?.page?.number + 1;
      }
    },
  });

  const queryClient = useQueryClient();

  const postMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: ICommentPost) => postComment(data, relatedType, relatedNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const post = (data: ICommentPost) => {
    return postMutation.mutateAsync(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["community", relatedNumber],
        });
        queryClient.invalidateQueries({
          queryKey: ["tripDetail", relatedNumber],
        });

        if (commentList.data) {
          queryClient.invalidateQueries({
            queryKey: ["comments", relatedType, relatedNumber],
          });
        }
      },
    });
  };

  const updateMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: { content: string; commentNumber: number }) =>
        updateComment(data, data.commentNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const update = (data: { content: string; commentNumber: number }) => {
    return updateMutation.mutateAsync(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["community", relatedNumber],
        });
        queryClient.invalidateQueries({
          queryKey: ["tripDetail", relatedNumber],
        });
        if (commentList.data) {
          queryClient.invalidateQueries({
            queryKey: ["comments", relatedType, relatedNumber],
          });
        }
      },
    });
  };

  const removeMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: { commentNumber: number }) => deleteComment(data.commentNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const remove = (data: { commentNumber: number }) => {
    return removeMutation.mutateAsync(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["community", relatedNumber],
        });
        queryClient.invalidateQueries({
          queryKey: ["tripDetail", relatedNumber],
        });
        if (commentList.data) {
          queryClient.invalidateQueries({
            queryKey: ["comments", relatedType, relatedNumber],
          });
        }
      },
    });
  };

  const likeMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: { commentNumber: number }) => likeComment(data.commentNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const like = (data: { commentNumber: number }) => {
    return likeMutation.mutateAsync(data, {
      onSuccess: () => {
        if (commentList.data) {
          queryClient.invalidateQueries({
            queryKey: ["comments", relatedType, relatedNumber],
          });
        }
      },
    });
  };

  const unlikeMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: { commentNumber: number }) => unlikeComment(data.commentNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const unlike = (data: { commentNumber: number }) => {
    return unlikeMutation.mutateAsync(data, {
      onSuccess: () => {
        if (commentList.data) {
          queryClient.invalidateQueries({
            queryKey: ["comments", relatedType, relatedNumber],
          });
        }
      },
    });
  };

  return {
    post,
    postMutation,
    update,
    updateMutation,
    remove,
    removeMutation,
    like,
    likeComment,
    unlike,
    unlikeMutation,
    commentList,
  };
};

export default useComment;
