"use client";
import Button from "@/components/designSystem/Buttons/Button";
import InputField from "@/components/designSystem/input/InputField";
import TextareaField from "@/components/designSystem/input/TextareaField";
import FifthStepIcon from "@/components/icons/step/trip/FifthStopIcon";
import Spacing from "@/components/Spacing";
import useViewTransition from "@/hooks/useViewTransition";
import { createTripStore } from "@/store/client/createTripStore";
import { isGuestUser } from "@/utils/user";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const CreateTripIntroduce = () => {
  const { title: initTitle, details: initDetails, addDetails, addTitle } = createTripStore();
  const [title, setTitle] = useState(initTitle);
  const [details, setDetails] = useState(initDetails);
  const navigateWithTransition = useViewTransition();
  const router = useRouter();
  useEffect(() => {
    if (isGuestUser()) {
      router.replace("/");
    }
  }, [isGuestUser()]);
  const changeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleRemoveValue = () => setTitle("");

  const handleNext = () => {
    if (title.length > 20 || title === "") {
      return;
    } else if (details.length > 2000 || details === "") {
      return;
    }
    addTitle(title);
    addDetails(details);
    document.documentElement.style.viewTransitionName = "instant";
    navigateWithTransition("/create/trip/detail");
  };

  return (
    <div className="px-6">
      <div className="mt-2 mb-10">
        <FifthStepIcon />
      </div>
      <h2 className="text-xl font-semibold leading-7 ml-[6px] text-left">여행을 소개해주세요.</h2>
      <Spacing size={16} />
      <InputField
        value={title}
        placeholder="제목을 입력해주세요. (최대 20자)"
        handleRemoveValue={handleRemoveValue}
        onChange={changeKeyword}
      />

      <Spacing size={16} />
      <TextareaField
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="어떤 여행을 떠나실 예정인가요?
자유롭게 소개해보세요. (최대 2,000자)"
      />
      <div className="absolute left-0 bottom-0 w-full px-6 bg-white pt-4 pb-10">
        <Button
          onClick={handleNext}
          disabled={title === "" || details === ""}
          addStyle={
            title === "" || details === ""
              ? {
                  backgroundColor: "rgba(220, 220, 220, 1)",
                  color: "rgba(132, 132, 132, 1)",
                  boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                }
              : undefined
          }
          text={"다음"}
        />
      </div>
    </div>
  );
};

export default CreateTripIntroduce;
