"use client";
import {
  deleteMyAccount,
  deleteMyProfileImage,
  deleteTempProfileImage,
  getMyPage,
  getMyProfileImage,
  intialPostMyProfileImage,
  postTempMyProfileImage,
  postVerifyPassword,
  putMyPage,
  putMyProfileDefaultImage,
  putMyProfileImage,
  putPassword,
  putRealMyProfileImage,
  NewPasswordProps,
} from "@/entities/myPage";
import { createMutationOptions } from "@/shared/lib/errors";
import { authStore } from "@/store/client/authStore";
import { myPageStore } from "@/store/client/myPageStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useMyPage = () => {
  const { userId, accessToken } = authStore();
  const { name, preferredTags, agegroup, addProfileUrl } = myPageStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myPage"],
    queryFn: () => getMyPage(accessToken!),
    enabled: !!accessToken,
    retry: !!accessToken,
    staleTime: 0,
  });

  const { mutateAsync: updateMyPageMutation, isSuccess: isUpdatedSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: () => putMyPage(accessToken!, name, "", preferredTags, agegroup),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPage"] });
    },
  });
  // 비밀번호 변경시 현재 비밀번호 확인
  const {
    mutateAsync: verifyPasswordMutation,
    isSuccess: isVerified,
    isError: isVerifiedError,
  } = useMutation({
    ...createMutationOptions({
      mutationFn: (password: string) => postVerifyPassword(accessToken!, password),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPage"] });
    },
  });
  const {
    mutateAsync: updatePasswordMutation,
    isSuccess: isUpatedPassword,
    isError: isUpdatedPasswordError,
  } = useMutation({
    ...createMutationOptions({
      mutationFn: (formData: NewPasswordProps) => putPassword(accessToken!, formData.newPassword, formData.newPassword),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPage"] });
    },
  });

  // 마이페이지 프로필 이미지 부분
  // 사진을 업로드 해서 response의 url를 통해 화면에 보여주기.

  // 첫 프로필 기본으로 post 요청

  const { mutateAsync: firstProfileImageMutation, isSuccess: isFirstProfileImagePostSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: (token: string) => intialPostMyProfileImage(token!) as any,
      policy: { network: 'toast', system: 'toast' },
    }),
    mutationKey: ["firstProfileImage"],
    onSuccess: (data: any) => {
      queryClient.refetchQueries({ queryKey: ["profileImg"] });
      if (data?.url) addProfileUrl(data.url);
    },
  });
  // 임시 저장 post 요청
  const { mutateAsync: tempProfileImageMutation, isSuccess: isTempProfileImagePostSuccess } = useMutation(
    createMutationOptions({
      mutationFn: (formData: FormData) => postTempMyProfileImage(accessToken!, formData),
      policy: { network: 'toast', system: 'toast' },
    }),
  );
  // 현재 프로필 조회.
  const { data: profileImage, isLoading: isLoadingImage } = useQuery({
    queryKey: ["profileImg"],
    queryFn: () => getMyProfileImage(accessToken!),
    enabled: !!accessToken,
  });
  // 커스텀 이미지로 update
  const { mutateAsync: updateProfileImgMutation, isSuccess: isUpdateProfileImgSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: (formData: FormData) => putMyProfileImage(accessToken!, formData),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => { queryClient.refetchQueries({ queryKey: ["profileImg"] }); },
  });

  // 정식 수정 등록
  const { mutateAsync: updateRealProfileImgMutation, isSuccess: isUpdateRealProfileImgSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: (imageUrl: string) => putRealMyProfileImage(accessToken!, imageUrl),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => { queryClient.refetchQueries({ queryKey: ["profileImg"] }); },
  });
  // default 이미지로 update
  const { mutateAsync: updateDefaultProfileImgMutation, isSuccess: isUpdateDefaultProfileImgSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: (defaultNumber: number) => putMyProfileDefaultImage(accessToken!, defaultNumber),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => { queryClient.refetchQueries({ queryKey: ["profileImg"] }); },
  });
  // 프로필 이미지 db에서 삭제
  const { mutateAsync: deleteMyProfileImgMutation, isSuccess: isDeleteSuccessProfileImg } = useMutation(
    createMutationOptions({
      mutationFn: () => deleteMyProfileImage(accessToken!),
      policy: { network: 'toast', system: 'toast' },
    }),
  );
  // 임시 저장된 미리보기 프로필 삭제
  const { mutateAsync: deleteTempProfileImgMutation, isSuccess: isDeleteSuccessTempProfileImg } = useMutation(
    createMutationOptions({
      mutationFn: (deletedTempUrl: string) => deleteTempProfileImage(accessToken!, deletedTempUrl),
      policy: { network: 'toast', system: 'toast' },
    }),
  );
  const {
    mutateAsync: withdrawMutation,
    isSuccess: isWithDrawSuccess,
    isError: isWithDrawError,
  } = useMutation(
    createMutationOptions({
      mutationFn: () => deleteMyAccount(accessToken!),
      policy: { network: 'toast', system: 'fallback' },
    }),
  );

  return {
    withdrawMutation,
    isWithDrawSuccess,
    isWithDrawError,

    data,
    isLoading,
    updateMyPageMutation,
    isUpdatedSuccess,

    isLoadingImage,
    verifyPasswordMutation,
    isVerified,
    isVerifiedError,
    updatePasswordMutation,
    isUpatedPassword,
    isUpdatedPasswordError,
    profileImage,
    firstProfileImageMutation,
    isFirstProfileImagePostSuccess,
    updateProfileImgMutation,
    isUpdateProfileImgSuccess,
    updateDefaultProfileImgMutation,
    isUpdateDefaultProfileImgSuccess,
    deleteMyProfileImgMutation,
    isDeleteSuccessProfileImg,
    updateRealProfileImgMutation,
    isUpdateRealProfileImgSuccess,
    // 프로필 임시 저장 요청.
    tempProfileImageMutation,
    isTempProfileImagePostSuccess,
    // 임시 프로필 삭제
    deleteTempProfileImgMutation,
    isDeleteSuccessTempProfileImg,
  };
};
export default useMyPage;
