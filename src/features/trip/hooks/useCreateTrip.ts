"use client";
import { createTrip, CreateTripReqData } from "@/entities/trip";
import { createMutationOptions } from "@/shared/lib/errors";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useCreateTrip = (travelData: CreateTripReqData, accessToken: string) => {
  const queryClient = useQueryClient();
  const { mutate: createTripMutate, isSuccess: isCreatedSuccess } = useMutation({
    ...createMutationOptions({
      mutationFn: () => createTrip(travelData, accessToken),
      policy: { network: 'retry', system: 'toast' },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["createTrip"] });
      queryClient.invalidateQueries({ queryKey: ["tripRecommendation"] });
      queryClient.invalidateQueries({ queryKey: ["availableTrips"] });
    },
  });
  return { createTripMutate, isCreatedSuccess };
};
