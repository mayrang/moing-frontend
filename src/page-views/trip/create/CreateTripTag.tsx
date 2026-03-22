"use client";
import { createTrip } from "@/api/trip";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import SearchFilterTag from "@/components/designSystem/tag/SearchFilterTag";
import FourthStepIcon from "@/components/icons/step/trip/FourthStepIcon";
import Spacing from "@/components/Spacing";
import { TAG_LIST } from "@/constants/tags";
import useViewTransition from "@/hooks/useViewTransition";
import { createTripStore } from "@/store/client/createTripStore";
import React, { useEffect, useState } from "react";
import TagList from "./component/TagList";
import { useRouter } from "next/navigation";
import { isGuestUser } from "@/utils/user";
import WarningToast from "@/components/designSystem/toastMessage/WarningToast";

const CreateTripTag = () => {
  const { tags, addTags } = createTripStore();
  const [taggedArray, setTaggedArray] = useState<string[]>(tags);
  const navigateWithTransition = useViewTransition();
  const [limitCountToastShow, setLimitCountToastShow] = useState(false);

  const router = useRouter();

  const isActive = (tag: string) => {
    return taggedArray.includes(tag);
  };
  useEffect(() => {
    if (isGuestUser()) {
      router.replace("/");
    }
  }, [isGuestUser()]);
  const clickTag = (index: number) => {
    if (taggedArray.length === 5) {
      if (!isActive(TAG_LIST.value[index])) {
        setLimitCountToastShow(true);
        return;
      }
    }

    const newArray = taggedArray.includes(TAG_LIST.value[index])
      ? taggedArray.filter((v) => v !== TAG_LIST.value[index])
      : [...taggedArray, TAG_LIST.value[index]];
    addTags(newArray);
    setTaggedArray(newArray);
  };
  const handleNext = () => {
    document.documentElement.style.viewTransitionName = "instant";
    navigateWithTransition("/create/trip/introduce");
  };
  return (
    <div className="px-6">
      <WarningToast
        height={120}
        isShow={limitCountToastShow}
        setIsShow={setLimitCountToastShow}
        text="최대 5개까지 설정할 수 있어요"
      />
      <div className="mt-2 mb-10">
        <FourthStepIcon />
      </div>
      <h2 className="text-xl font-semibold leading-7 ml-[6px] text-left">
        여행 스타일을 알려주세요 <span className="text-sm font-normal text-[var(--color-text-muted)]">(최대 5개)</span>
      </h2>
      <Spacing size={20} />
      <TagList taggedArray={taggedArray} clickTag={clickTag} />
      <ButtonContainer>
        <Button
          onClick={handleNext}
          disabled={tags.length === 0}
          addStyle={
            tags.length === 0
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

export default CreateTripTag;
