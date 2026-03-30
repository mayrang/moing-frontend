"use client";
import {
  deleteTripDetail,
  getCompanions,
  getTripDetail,
  getTripEnrollmentCount,
  updateTripDetail,
} from "@/entities/tripDetail";
import { UpdateTripReqData } from "@/entities/trip";
import { authStore } from "@/store/client/authStore";
import { createMutationOptions } from "@/shared/lib/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useTripDetail = (travelNumber: number) => {
  const { userId, accessToken, isGuestUser } = authStore();
  const queryClient = useQueryClient();
  const tripDetail = useQuery({
    queryKey: ["tripDetail", travelNumber],
    queryFn: () => getTripDetail(travelNumber, accessToken) as any,
    enabled: !!travelNumber && (isGuestUser || !!accessToken),
  });
  // 현재 신청 온 사람 수
  const tripEnrollmentCount = useQuery({
    queryKey: ["tripEnrollment", travelNumber],
    queryFn: () => getTripEnrollmentCount(travelNumber, accessToken) as any,
    enabled: !!travelNumber && (isGuestUser || !!accessToken),
  });

  const companions = useQuery({
    queryKey: ["companions", travelNumber],
    queryFn: () => getCompanions(travelNumber, accessToken) as any,
    enabled: !!travelNumber && (isGuestUser || !!accessToken),
  });

  const {
    mutate: updateTripDetailMutate,
    mutateAsync: updateTripDetailMutation,
    isSuccess: isEditSuccess,
  } = useMutation({
    ...createMutationOptions({
      mutationFn: (data: UpdateTripReqData) => updateTripDetail(travelNumber, data, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: ["tripDetail", travelNumber],
      });
    },
  });

  const { mutateAsync: deleteTripDetailMutation } = useMutation({
    ...createMutationOptions({
      mutationFn: () => deleteTripDetail(travelNumber, accessToken),
      policy: { network: 'toast', system: 'toast' },
    }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["tripRecommendation"] });
      queryClient.refetchQueries({ queryKey: ["availableTrips"] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["myTrips"] });
      }, 1500);
    },
  });

  return {
    tripDetail,
    isEditSuccess,
    updateTripDetailMutate,
    updateTripDetailMutation,
    deleteTripDetailMutation,
    companions,
    tripEnrollmentCount,
  };
};

export default useTripDetail;
