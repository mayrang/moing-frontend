
"use client";
import ThirdStepIcon from "@/components/icons/step/trip/ThirdStepIcon";
import Spacing from "@/components/Spacing";
import React, { ReactNode, useEffect } from "react";
import RecruitingWrapper from "./CreateTripDetail/RecruitingWrapper";
import EveryBodyIcon from "@/components/icons/EveryBodyIcon";
import OnlyMaleIcon from "@/components/icons/OnlyMaleIcon";
import OnlyFemaleIcon from "@/components/icons/OnlyFemaleIcon";
import { createTripStore } from "@/store/client/createTripStore";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import useViewTransition from "@/hooks/useViewTransition";
import { useRouter } from "next/navigation";
import { isGuestUser } from "@/utils/user";
export const selections = [
  {
    gender: "모두",
    icon: (isSelect: boolean) => <EveryBodyIcon selected={isSelect} />,
  },
  {
    gender: "남자만",
    icon: (isSelect: boolean) => <OnlyMaleIcon selected={isSelect} />,
  },
  {
    gender: "여자만",
    icon: (isSelect: boolean) => <OnlyFemaleIcon selected={isSelect} />,
  },
];

const CreateTripInfo = () => {
  const { genderType, addGenderType } = createTripStore();
  const clickGender = (genderType: string) => {
    addGenderType(genderType);
  };
  const navigateWithTransition = useViewTransition();
  const router = useRouter();
  useEffect(() => {
    if (isGuestUser()) {
      router.replace("/");
    }
  }, [isGuestUser()]);

  const handleNext = () => {
    if (!genderType) return;
    document.documentElement.style.viewTransitionName = "instant";
    navigateWithTransition("/create/trip/tag");
  };

  return (
    <div className="px-6">
      <div className="mt-2 mb-10">
        <ThirdStepIcon />
      </div>
      <h2 className="text-xl font-semibold leading-7 ml-[6px] text-left">여행의 구성은 어떻게 될까요?</h2>
      <Spacing size={20} />
      <RecruitingWrapper />
      <div className="bg-[#e7e7e7] w-full h-[1px] my-8" />
      <div>
        <div className="text-base font-semibold leading-[22px] text-left text-[var(--color-text-muted)] px-[6px] gap-2">성별 선택</div>
        <div className="flex gap-4 items-center mt-2">
          {selections.map((item) => (
            <div
              key={item.gender}
              className="flex cursor-pointer flex-col items-center gap-1 justify-center rounded-[20px] w-[90px] h-[84px]"
              style={{
                backgroundColor: genderType === item.gender ? "var(--color-keycolor-bg)" : "var(--color-search-bg)",
                border: genderType === item.gender ? "1px solid var(--color-keycolor)" : "0px",
                color: genderType === item.gender ? "var(--color-keycolor)" : "var(--color-text-base)",
                fontWeight: genderType === item.gender ? 600 : 400,
              }}
              onClick={() => clickGender(item.gender)}
            >
              {item.icon(genderType === item.gender)}
              <div className="text-sm leading-5">{item.gender}</div>
            </div>
          ))}
        </div>
      </div>
      <ButtonContainer>
        <Button
          onClick={handleNext}
          disabled={!genderType}
          addStyle={
            !genderType
              ? {
                  backgroundColor: "rgba(220, 220, 220, 1)",
                  color: "rgba(132, 132, 132, 1)",
                  boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                }
              : undefined
          }
          text={"다음"}
        />
      </ButtonContainer>
    </div>
  );
};

export default CreateTripInfo;
