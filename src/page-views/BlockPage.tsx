"use client";
import { getBlock } from "@/api/report";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

const Block = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  if (!token) {
    router.replace("/");
    return null;
  }
  const { data, isLoading } = useQuery({
    queryKey: ["block", token],
    queryFn: () => {
      return getBlock(token!) as any;
    },
  });

  return (
    <div>
      <header className="flex h-[100px] items-center relative top-0 bg-[var(--color-bg)] z-[1000] w-full">
        <div className="w-12 h-12 absolute top-10 left-6 flex items-center justify-center" onClick={() => router.replace("/login")}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.7782 2.22202L2.22183 17.7784M17.7782 17.7784L2.22183 2.22202"
              stroke="#343434"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </header>
      <div className="px-6">
        <div className="mt-6 w-full flex items-center flex-col justify-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_5166_24880)">
              <circle cx="12" cy="12" r="12" fill="#3E8D00" />
              <path
                d="M11.668 6.33333C11.668 6.14924 11.8172 6 12.0013 6V6C12.1854 6 12.3346 6.14924 12.3346 6.33333V12.8667C12.3346 13.0508 12.1854 13.2 12.0013 13.2V13.2C11.8172 13.2 11.668 13.0508 11.668 12.8667V6.33333Z"
                stroke="#FDFDFD"
                strokeWidth="2"
              />
              <path
                d="M10.5 17.5C10.5 16.6716 11.1716 16 12 16C12.8284 16 13.5 16.6716 13.5 17.5C13.5 18.3284 12.8284 19 12 19C11.1716 19 10.5 18.3284 10.5 17.5Z"
                fill="#FDFDFD"
              />
            </g>
            <defs>
              <clipPath id="clip0_5166_24880">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <div className="leading-[31px] font-semibold text-2xl text-[var(--color-text-base)]">현재 차단된 계정이에요</div>
        </div>
        <div className="w-full h-px bg-[#e7e7e7] my-10" />
        <div className="rounded-[20px] w-full h-[120px] p-5 bg-[var(--color-search-bg)] flex items-center gap-3">
          <Image
            src={"/images/defaultProfile.png"}
            alt="profile"
            width={80}
            height={80}
            style={{ borderRadius: "50%" }}
          />
          <div className="flex flex-col gap-2">
            <div className="leading-4 text-xl font-semibold text-[var(--color-text-base)]">{data?.userName}</div>
            <div className="leading-4 text-xs font-normal text-[var(--color-text-muted)]">{data?.userEmail}</div>
          </div>
        </div>
        <div className="mt-8 px-[18px] text-center leading-[19.6px] text-sm font-normal">
          신고가 10회 이상 접수되었습니다. <br /> 이에 따라 회원님의 계정 접속을 차단하였습니다. <br /> 계정 차단은
          {data?.blockPeriod}까지 적용됩니다.
          <br /> <br /> 문의가 있으실 경우,
          <br /> 문의하기를 통해 접수해주시기 바랍니다.
        </div>
      </div>
      <ButtonContainer>
        <Button onClick={() => router.replace(`/contact?type=block&email=${data?.userEmail}`)} text={"문의하기"} />
      </ButtonContainer>
    </div>
  );
};

export default Block;
