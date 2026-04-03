"use client";
import {
  deleteCommunity,
  getCommunities,
  getCommunity,
  getImages,
  getMyCommunities,
  likeCommunity,
  postCommunity,
  postImage,
  unlikeCommunity,
  updateCommunity,
  updateImage,
  IListParams,
  ICommunityList,
  PostCommunity,
} from "@/entities/community";
import { createMutationOptions } from "@/shared/lib/errors";
import { authStore } from "@/store/client/authStore";
import { EditFinalImages, FinalImages } from "@/store/client/imageStore";
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { IListParams };

const useCommunity = (
  communityNumber: number | undefined = undefined,
  params: IListParams = {
    sortingTypeName: "최신순",
    keyword: "",
    categoryName: "",
  },
  isMine = false
) => {
  const { sortingTypeName = "최신순", keyword = "", categoryName = "전체" } = params;

  const { accessToken, isGuestUser } = authStore();
  const communityList = useInfiniteQuery<
    ICommunityList,
    Object,
    InfiniteData<ICommunityList>,
    [_1: string, _2: { categoryName: string; sortingTypeName: string; keyword: string }, _3: boolean]
  >({
    queryKey: ["community", { categoryName: categoryName, sortingTypeName, keyword }, isMine],
    enabled: isMine ? !!accessToken : isGuestUser || !!accessToken,
    queryFn: async ({ pageParam }) => {
      if (isMine && accessToken) {
        return getMyCommunities(accessToken, {
          ...params,
          page: pageParam as number,
        }) as any;
      }
      return getCommunities(accessToken, {
        ...params,
        page: pageParam as number,
      });
    },
    initialPageParam: 0,
    staleTime: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.page?.number + 1 === lastPage?.page?.totalPages) {
        return undefined;
      } else {
        return lastPage?.page?.number + 1;
      }
    },
  });
  const community = useQuery({
    queryKey: ["community", communityNumber],
    queryFn: () => getCommunity(communityNumber!, accessToken),
    enabled: !!communityNumber && (isGuestUser || !!accessToken),
  });

  const images = useQuery({
    queryKey: ["community", "images", communityNumber],
    queryFn: () => getImages(communityNumber!, accessToken),
    enabled: !!communityNumber,
  });

  const postImageMutation = useMutation({
    ...createMutationOptions({
      mutationFn: (data: { uploadImages: FinalImages; communityNumber: number }) =>
        postImage(data.uploadImages, data.communityNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => {
      if (images.data) {
        queryClient.invalidateQueries({ queryKey: ["community", "images", communityNumber] });
      }
    },
  });

  const updateImageMutation = useMutation({
    ...createMutationOptions({
      mutationFn: (data: { editImages: EditFinalImages; communityNumber: number }) =>
        updateImage(data.editImages, data.communityNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => {
      if (images.data) {
        queryClient.invalidateQueries({ queryKey: ["community", "images", communityNumber] });
      }
    },
  });

  const queryClient = useQueryClient();

  const postMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: PostCommunity) => postCommunity(data, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const post = (data: PostCommunity) => {
    return postMutation.mutateAsync(data, {
      onSuccess: () => {
        if (communityList.data) {
          queryClient.invalidateQueries({
            queryKey: ["community"],
          });
        }
      },
    });
  };

  const updateMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: PostCommunity & { communityNumber: number }) =>
        updateCommunity(data, data.communityNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const update = (data: PostCommunity & { communityNumber: number }) => {
    return updateMutation.mutateAsync(data, {
      onSuccess: () => {
        if (communityList.data) {
          queryClient.invalidateQueries({
            queryKey: ["community"],
          });
        }
      },
    });
  };

  const removeMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: { communityNumber: number }) => deleteCommunity(data.communityNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const remove = (data: { communityNumber: number }) => {
    return removeMutation.mutateAsync(data, {
      onSuccess: () => {
        if (communityList.data) {
          queryClient.invalidateQueries({
            queryKey: ["community"],
            exact: true,
          });
        }
      },
    });
  };

  const likeMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: { communityNumber: number }) => likeCommunity(data.communityNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const like = (data: { communityNumber: number }) => {
    return likeMutation.mutateAsync(data, {
      onSuccess: () => {
        if (communityList.data) {
          queryClient.invalidateQueries({
            queryKey: ["community", data.communityNumber],
          });
        }
      },
    });
  };

  const unlikeMutation = useMutation(
    createMutationOptions({
      mutationFn: (data: { communityNumber: number }) => unlikeCommunity(data.communityNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
  );

  const unlike = (data: { communityNumber: number }) => {
    return unlikeMutation.mutateAsync(data, {
      onSuccess: () => {
        if (communityList.data) {
          queryClient.invalidateQueries({
            queryKey: ["community", data.communityNumber],
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
    likeMutation,
    unlike,
    unlikeMutation,
    communityList,
    community,
    images,
    postImageMutation,
    updateImageMutation,
  };
};

export default useCommunity;
