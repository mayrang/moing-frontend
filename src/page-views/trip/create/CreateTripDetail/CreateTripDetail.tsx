"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/designSystem/Buttons/Button";
import { useRouter } from "next/navigation";

import { createTripStore } from "@/store/client/createTripStore";
import { useCreateTrip } from "@/hooks/createTrip/useCreateTrip";
import { authStore } from "@/store/client/authStore";
import ButtonContainer from "@/components/ButtonContainer";
import TopModal from "@/components/TopModal";
import RegionWrapper from "./RegionWrapper";
import InputField from "@/components/designSystem/input/InputField";
import Spacing from "@/components/Spacing";
import TextareaField from "@/components/designSystem/input/TextareaField";
import TagListWrapper from "./TagListWrapper";
import CalendarWrapper from "./CalendarWrapper";
import InfoWrapper from "./InfoWrapper";
import MapContainer from "./MapContainer";
import { useInView } from "react-intersection-observer";
import "dayjs/locale/ko";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import CreateScheduleItem from "./CreateScheduleItem";
import TripToast from "@/components/designSystem/toastMessage/tripToast";
import { getDateRangeCategory } from "@/utils/time";
import { tripPlanStore } from "@/store/client/tripPlanStore";

dayjs.locale("ko");
dayjs.extend(isSameOrBefore);
export function getDatesArray(startDate, endDate) {
  const dates: string[] = [];
  let currentDate = dayjs(startDate);
  const lastDate = dayjs(endDate);

  while (currentDate.isSameOrBefore(lastDate)) {
    dates.push(currentDate.format("M월D일(ddd)"));
    currentDate = currentDate.add(1, "day");
  }

  return dates;
}

const CreateTripDetail = () => {
  const {
    locationName,
    title,
    details,
    addTitle,
    addDetails,
    tags,
    initGeometry,
    addTags,
    date,
    plans,
    genderType,
    addDate,
    addGenderType,
    addMaxPerson,
    maxPerson,
    addPlans,
    addLocationName,
    addInitGeometry,
    periodType,
    addCompletionStatus,
    resetCreateTripDetail,
  } = createTripStore();

  const [topModalHeight, setTopModalHeight] = useState(0);
  const handleRemoveValue = () => addTitle("");
  const [isMapFull, setIsMapFull] = useState(false);
  const [isToastShow, setIsToastShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const changeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    addTitle(e.target.value);
  };
  const { accessToken } = authStore();
  const [openItemIndex, setOpenItemIndex] = useState(0);
  const router = useRouter();
  const handleItemToggle = (index) => {
    setOpenItemIndex(openItemIndex === index ? null : index);
  };
  const { isChange, addIsChange, planIndex, addPlanIndex } = tripPlanStore();

  useEffect(() => {
    if (isChange) {
      setOpenItemIndex(planIndex);
      addPlanIndex(0);
      addIsChange(false);
    }
  }, [planIndex, isChange]);

  const newPlan = plans.map((plan) => {
    return {
      ...plan,
      planOrder: plan.planOrder + 1,
      spots: plan.spots.map((spot) => {
        const { id, ...newSpots } = {
          ...spot,
          latitude: Number(spot.latitude.toFixed(9)),
          longitude: Number(spot.longitude.toFixed(9)),
        };
        return newSpots;
      }),
    };
  });

  const travelData = {
    title,
    details,
    maxPerson,
    genderType: genderType!,
    startDate: date?.startDate ?? "",
    endDate: date?.endDate ?? "",
    periodType: getDateRangeCategory(
      date?.startDate ?? "",
      date?.endDate ?? ""
    ),
    locationName: locationName.locationName,
    countryName: locationName.countryName,
    tags,
    plans: newPlan,
  };
  const { createTripMutate } = useCreateTrip(travelData, accessToken as string);

  const completeClickHandler = () => {
    if (
      title === "" ||
      details === "" ||
      details === "" ||
      maxPerson === 0 ||
      genderType === "" ||
      !date?.startDate ||
      !date?.endDate ||
      periodType === "" ||
      tags.length === 0 ||
      locationName.locationName === ""
    ) {
      addCompletionStatus(false);
    }

    createTripMutate(undefined, {
      onSuccess: (data: any) => {
        resetCreateTripDetail();

        if (data) {
          router.push(`/trip/detail/${data.travelNumber}`);
        } else {
          router.push(`/`);
        }
      },
      onError: () => {
        // 여행 생성에 오류 발생.
      },
    });
  };

  useEffect(() => {
    if (isMapFull) {
      setIsToastShow(false);
    } else {
      setIsToastShow(true);
    }
  }, [isMapFull]);

  return (
    <>
      <div className="relative">
        <div
          id="container-scroll"
          ref={containerRef}
          className="px-6 overflow-y-auto relative h-[calc(100svh-116px)] no-scrollbar overscroll-none pb-[104px]"
        >
          <TopModal
            isToastShow={isToastShow}
            containerRef={containerRef}
            setIsMapFull={setIsMapFull}
            onHeightChange={setTopModalHeight}
          >
            <div className="px-6">
              <RegionWrapper
                locationName={locationName}
                addInitGeometry={addInitGeometry}
                addLocationName={addLocationName}
              />
              <Spacing size={16} />
              <InputField
                value={title}
                placeholder="제목을 입력해주세요. (최대 20자)"
                handleRemoveValue={handleRemoveValue}
                onChange={changeKeyword}
              />

              <Spacing size={16} />
              <TextareaField
                minRows={3}
                maxRows={6}
                isFlexible
                value={details}
                onChange={(e) => addDetails(e.target.value)}
                placeholder="어떤 여행을 떠나실 예정인가요?
자유롭게 소개해보세요. (최대 2,000자)"
              />
              <Spacing size={16} />
              <TagListWrapper addTags={addTags} taggedArray={tags} />
              <Spacing size={16} />
              <div className="bg-[#e7e7e7] w-full h-[1px]" />
              <CalendarWrapper addDate={addDate} date={date} />
              <div className="bg-[#e7e7e7] w-full h-[1px]" />
              <InfoWrapper
                addGenderType={addGenderType}
                addMaxPerson={addMaxPerson}
                maxPerson={maxPerson}
                genderType={genderType}
              />
            </div>
          </TopModal>
          <div
            style={{
              marginTop: `${isMapFull ? 32 : topModalHeight + 32}px`,
              minHeight: "100svh",
              transition: "padding-top 0.3s ease-out",
              overscrollBehavior: "none",
            }}
          >
            <MapContainer
              index={openItemIndex}
              plans={plans}
              locationName={locationName}
              isMapFull={isMapFull}
              lat={initGeometry?.lat || 37.57037778}
              lng={initGeometry?.lng || 126.9816417}
              zoom={locationName.mapType === "google" ? 11 : 9}
            />
            <div className="mt-6">
              <div className="text-lg font-medium text-black leading-[21px]">여행 일정</div>
              <div className="flex flex-col gap-4 mt-4">
                {date &&
                  getDatesArray(date?.startDate ?? "", date?.endDate ?? "").map(
                    (item, idx) => (
                      <CreateScheduleItem
                        key={idx}
                        plans={plans}
                        idx={idx}
                        addPlans={addPlans}
                        type="create"
                        title={item}
                        isOpen={openItemIndex === idx}
                        onToggle={() => handleItemToggle(idx)}
                      />
                    )
                  )}
              </div>
            </div>
          </div>
        </div>

        <ButtonContainer>
          <Button
            text="완료"
            onClick={completeClickHandler}
            addStyle={{
              backgroundColor: "rgba(62, 141, 0, 1)",
              color: "rgba(240, 240, 240, 1)",
              boxShadow: "rgba(170, 170, 170, 0.1)",
            }}
          />
        </ButtonContainer>
      </div>
    </>
  );
};

export default CreateTripDetail;
