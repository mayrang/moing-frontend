"use client";
import Button from "@/components/designSystem/Buttons/Button";
import ButtonContainer from "@/components/ButtonContainer";
import InputField from "@/components/designSystem/input/InputField";
import FirstStepIcon from "@/components/icons/step/trip/FirstStepIcon";
import PlaceIcon from "@/components/icons/PlaceIcon";
import RelationKeywordList from "@/components/relationKeyword/RelationKeywordList";
import Spacing from "@/components/Spacing";
import useRelationKeyword from "@/hooks/search/useRelationKeyword";
import { createTripStore } from "@/store/client/createTripStore";
import React, { useEffect, useMemo, useState } from "react";

import useViewTransition from "@/hooks/useViewTransition";
import TripRegion from "@/components/TripRegion";
import { isGuestUser } from "@/utils/user";
import { useRouter } from "next/navigation";

export default function CreateTripRegion() {
  const navigateWithTransition = useViewTransition();
  const { addLocationName, locationName, resetCreateTripDetail } = createTripStore();
  // const isMatchedKeyword = useMemo(() => {
  //   if (data?.suggestions && Array.isArray(data.suggestions)) {
  //     return data.suggestions.includes(keyword)
  //   } else {
  //     return false
  //   }
  // }, [keyword, data?.suggestions])
  const router = useRouter();
  useEffect(() => {
    if (isGuestUser()) {
      router.replace("/");
    }
  }, [isGuestUser()]);

  useEffect(() => {
    const onPopState = (e) => {
      // 뒤로가기 버튼 클릭 시 실행할 로직
      resetCreateTripDetail();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleNext = () => {
    document.documentElement.style.viewTransitionName = "instant";
    navigateWithTransition("/create/trip/date");
  };
  return (
    <div className="px-6">
      <div className="mt-2 mb-10">
        <FirstStepIcon />
      </div>
      <TripRegion addLocationName={addLocationName} initLocationName={locationName} nextFunc={handleNext} />
    </div>
  );
}
