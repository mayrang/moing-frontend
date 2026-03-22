"use client";
import { useParams, useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import { REPORT_LIST } from "@/page-views/report/ReportPage";
import Spacing from "@/components/Spacing";
import Image from "next/image";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import TextareaField from "@/components/designSystem/input/TextareaField";
import { postReport } from "@/api/report";
import { authStore } from "@/store/client/authStore";
import { reportStore } from "@/store/client/reportStore";
import { useMutation } from "@tanstack/react-query";
import { errorStore } from "@/store/client/errorStore";
import { userProfileOverlayStore } from "@/store/client/userProfileOverlayStore";

const ReportDetail = () => {
  const { reportType, id, type: backType } = useParams();
  const { accessToken } = authStore();
  const router = useRouter();
  const [text, setText] = useState("");
  const { detailId, setDetailId, setReportSuccess, userNumber, setUserNumber } = reportStore();
  const [checkIndex, setCheckIndex] = useState(-1);
  const { updateError, setIsMutationError } = errorStore();

  const type = REPORT_LIST.find((item) => item.query === reportType);
  const { mutate, isSuccess, isError } = useMutation({
    mutationFn: (data: any) => {
      return postReport(data, accessToken as string);
    },
    onSuccess: (data: any) => {
      if (data.success === "이미 신고한 이력이 있습니다.") {
        updateError(data.success);
        setIsMutationError(true);
      }
    },
  });

  useEffect(() => {
    if (isSuccess) {
      switch (backType) {
        case "travel":
          router.replace(`/trip/detail/${id}`);
          setUserNumber(null);

          setTimeout(() => {
            setReportSuccess(true);
          }, 300);
          return;
        case "travelComment":
          if (!detailId) return;
          router.replace(`/trip/detail/${detailId}`);
          setUserNumber(null);

          setTimeout(() => {
            setReportSuccess(true);
          }, 300);
          return;
        case "communityComment":
          if (!detailId) return;
          router.replace(`/community/detail/${detailId}`);
          setDetailId(null);
          setUserNumber(null);

          setTimeout(() => {
            setReportSuccess(true);
          }, 300);
          return;
        case "community":
          router.replace(`/community/detail/${id}`);
          setDetailId(null);
          setUserNumber(null);
          setTimeout(() => {
            setReportSuccess(true);
          }, 300);
          return;
        case "userProfile":
          const { setProfileShow } = userProfileOverlayStore();
          setProfileShow(true);
          setUserNumber(null);
          setTimeout(() => {
            setReportSuccess(true);
          }, 300);
          return;
        default:
          router.replace("/");
      }
    }
  }, [isSuccess, isError]);
  const handleClick = (idx: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    setCheckIndex((prev) => (prev === idx ? -1 : idx));
  };

  const submitReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !accessToken || !userNumber) {
      return;
    }
    if (type?.query === "etc") {
      mutate({
        reportedUserNumber: userNumber,
        reportReasonId: 13,
        reportReasonExtra: text,
      });
    } else {
      if (!type?.item?.[checkIndex].id) {
        return;
      }
      mutate({
        reportedUserNumber: userNumber,
        reportReasonId: type?.item?.[checkIndex].id,
      });
    }
  };
  if (!type) {
    router.back();
  }
  if (type?.query === "etc") {
    return (
      <div className="px-6 pt-[18px] pb-[214px]">
        <div className="text-lg leading-9 font-semibold pl-[6px] flex items-center">{type?.title}</div>
        <Spacing size={16} />
        <TextareaField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="신고 사유 직접 입력 (최대 500자)"
          height="120px"
          placeholderColor="var(--color-text-muted)"
          isReport
          padding={"12px 16px"}
          lineHeight="20px"
          fontSize="14px"
        />

        <ButtonContainer>
          <Button
            onClick={submitReport}
            disabled={!id || !accessToken || !userNumber || text === "" ? true : false}
            addStyle={
              (!id || !accessToken || !userNumber || text === "" ? true : false)
                ? {
                    backgroundColor: "rgba(220, 220, 220, 1)",
                    color: "rgba(132, 132, 132, 1)",
                    boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                  }
                : undefined
            }
            text={"신고하기"}
          />
        </ButtonContainer>
      </div>
    );
  }
  return (
    <div className="px-6 pt-[18px] pb-[214px]">
      <div className="text-lg leading-9 font-semibold pl-[6px] flex items-center">{type?.title}</div>
      <Spacing size={16} />
      {type?.item?.map((item, idx) => (
        <div
          key={item.id}
          className="flex cursor-pointer text-base leading-4 font-normal w-full items-center gap-2 h-[66px] border-b border-[#e7e7e7]"
          style={{ borderTop: idx === 0 ? "1px solid #e7e7e7" : "0" }}
          onClick={handleClick(idx)}
        >
          <Image
            src={checkIndex === idx ? "/images/radio_active.svg" : "/images/radio.svg"}
            alt=""
            height={18}
            width={18}
          />

          <div className="pl-1">{item.title}</div>
        </div>
      ))}
      <ButtonContainer>
        <Button
          onClick={submitReport}
          disabled={!id || !accessToken || !userNumber || checkIndex === -1 || checkIndex === 5 ? true : false}
          addStyle={
            (!id || !accessToken || !userNumber || checkIndex === -1 || checkIndex === 5 ? true : false)
              ? {
                  backgroundColor: "rgba(220, 220, 220, 1)",
                  color: "rgba(132, 132, 132, 1)",
                  boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                }
              : undefined
          }
          text={"신고하기"}
        />
      </ButtonContainer>
    </div>
  );
};

export default ReportDetail;
