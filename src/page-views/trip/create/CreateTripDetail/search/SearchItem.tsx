"use client";
import { createTripStore } from "@/store/client/createTripStore";
import { editTripStore } from "@/store/client/editTripStore";
import { tripPlanStore } from "@/store/client/tripPlanStore";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { MouseEvent } from "react";
import { v4 as uuidv4 } from "uuid";

const SearchItem = ({
  id,
  title,
  type,
  location,
  lng,
  lat,
}: {
  id: string;
  title: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
}) => {
  const router = useRouter();
  const { planOrder } = useParams();
  const { addIsChange } = tripPlanStore();
  const searchParams = useSearchParams();
  const paramsType = searchParams?.get("type") ?? "create";
  const travelNumber = searchParams?.get("travelNumber") ?? "";
  const {
    locationName: { mapType, locationName },
    addPlans,
    plans,
  } = paramsType === "create" ? createTripStore() : editTripStore();
  const handlePlans = (e: MouseEvent) => {
    e.stopPropagation();
    if (!planOrder) return;
    const targetPlanIndex = plans.findIndex(
      (plan) =>
        plan.planOrder ===
        (paramsType === "create" ? Number(planOrder) : Number(planOrder) + 1)
    );
    let newPlans: any[] = [];
    if (targetPlanIndex > -1) {
      newPlans = plans.map((plan) =>
        plan.planOrder ===
        (paramsType === "create" ? targetPlanIndex : targetPlanIndex + 1)
          ? {
              ...plan,
              spots: [
                ...plan.spots,
                {
                  id: uuidv4(),
                  name: title,
                  category: type,
                  region: locationName,
                  latitude: Number(lat),
                  longitude: Number(lng),
                },
              ],
            }
          : { ...plan }
      );
    } else {
      newPlans = [
        ...plans,
        {
          planOrder:
            paramsType === "create" ? Number(planOrder) : Number(planOrder) + 1,
          spots: [
            {
              id: uuidv4(),
              name: title,
              category: type,
              region: location,
              latitude: Number(lat),
              longitude: Number(lng),
            },
          ],
        },
      ];
    }
    addPlans(newPlans);
    addIsChange(true);
    if (paramsType === "create") {
      router.push("/create/trip/detail");
    } else {
      router.push(`/trip/edit/${travelNumber}`);
    }
  };
  return (
    <div
      className="flex items-center h-[69px] w-full gap-1 cursor-pointer border-b border-[#e7e7e7]"
      onClick={() =>
        router.push(
          `/search/place/${planOrder}/${mapType === "google" ? id : title}?type=${paramsType}${paramsType === "edit" ? `&travelNumber=${travelNumber}` : ""}`
        )
      }
    >
      <svg
        width="32"
        height="33"
        viewBox="0 0 32 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 14.4091C25 21.7273 16 28 16 28C16 28 7 21.7273 7 14.4091C7 11.9136 7.94821 9.52041 9.63604 7.75586C11.3239 5.99131 13.6131 5 16 5C18.3869 5 20.6761 5.99131 22.364 7.75586C24.0518 9.52041 25 11.9136 25 14.4091Z"
          fill="#CDCDCD"
        />
        <path
          d="M15.9961 17.5457C17.6529 17.5457 18.9961 16.1415 18.9961 14.4093C18.9961 12.6771 17.6529 11.2729 15.9961 11.2729C14.3392 11.2729 12.9961 12.6771 12.9961 14.4093C12.9961 16.1415 14.3392 17.5457 15.9961 17.5457Z"
          fill="#FEFEFE"
        />
      </svg>
      <div className="flex-1 flex flex-col gap-1">
        <div className="leading-[19px] text-base font-semibold text-[var(--color-text-base)]">{title}</div>
        <div className="leading-[14px] text-xs text-[var(--color-text-muted)] font-normal">
          {type}ㆍ{location}
        </div>
      </div>
      <button
        type="button"
        className="bg-[var(--color-muted5)] text-[var(--color-text-base)] leading-[14px] cursor-pointer text-xs font-semibold px-[10px] py-[6px] rounded-[20px]"
        onClick={handlePlans}
      >
        추가
      </button>
    </div>
  );
};

export default SearchItem;
