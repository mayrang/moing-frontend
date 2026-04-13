"use client";
import { postContact } from "@/api/contact";
import ButtonContainer from "@/components/ButtonContainer";
import Button from "@/components/designSystem/Buttons/Button";
import InputField from "@/components/designSystem/input/InputField";
import TextareaField from "@/components/designSystem/input/TextareaField";
import ResultModal from "@/components/designSystem/modal/ResultModal";
import Select from "@/components/designSystem/Select";
import BoxLayoutTag from "@/components/designSystem/tag/BoxLayoutTag";
import Spacing from "@/components/Spacing";
import RequestError from "@/context/ReqeustError";
import { IContactCreate } from "@/model/contact";
import { authStore } from "@/store/client/authStore";
import { myPageStore } from "@/store/client/myPageStore";
import { useMutation } from "@tanstack/react-query";
import { createMutationOptions } from "@/shared/lib/errors";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

const INQUIRYTYPE_LIST = ["계정 및 로그인", "서비스 이용 방법", "이용 불편 및 신고", "기타 문의"];

const CreateContact = () => {
  const { email: initEmail } = myPageStore();
  const searchParams = useSearchParams();
  const type = searchParams?.get("type") ?? "";
  const paramsEmail = searchParams?.get("email") ?? "";
  const [isChange, setIsChange] = useState<boolean>(false);
  const [inquiryType, setInquiryType] = useState<string>(
    type === "block" ? "계정 신고 및 차단 문의" : "계정 및 로그인"
  );
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const { accessToken } = authStore();

  useEffect(() => {
    if (paramsEmail !== "") {
      setEmail(paramsEmail);
      return;
    }
    if (initEmail !== "") {
      setEmail(initEmail);
    }
  }, [initEmail, paramsEmail]);
  const createContact = useMutation({
    ...createMutationOptions({
      mutationFn: async (data: IContactCreate) => {
        const result = await postContact(data, accessToken);
        return result as any;
      },
      policy: { network: 'toast', system: 'toast' },
    }),
    mutationKey: ["createContact"],
    onSuccess: () => {
      setIsResultModalOpen(true);
      setTitle("");
      setContent("");
    },
  });

  const submitContact = (e: FormEvent) => {
    e.preventDefault();
    createContact.mutate({ inquiryType, email, title, content });
  };
  return (
    <>
      <div className="px-6 min-h-full overflow-y-auto w-full">
        <div className="my-6">
          <label htmlFor="inqueryType" className="block py-[10px] px-[6px] text-base mb-1 leading-4 tracking-[-0.025em] font-semibold">문의 유형을 선택해주세요</label>

          {type === "block" ? (
            <div className="h-12 w-full rounded-[30px] bg-[var(--color-bg)] border border-[var(--color-muted3)] px-5 py-[14px] text-base leading-5 text-[var(--color-text-muted)] font-normal">계정 신고 및 차단 문의</div>
          ) : (
            <Select
              id="inQueryType"
              width="100%"
              value={inquiryType}
              setValue={setInquiryType}
              list={INQUIRYTYPE_LIST}
            ></Select>
          )}
        </div>
        <div className="mt-6" style={{ marginBottom: isChange ? "32px" : "47px" }}>
          <label htmlFor="email" className="block py-[10px] px-[6px] text-base mb-1 leading-4 tracking-[-0.025em] font-semibold">답변 받을 이메일</label>
          {isChange || initEmail === "" ? (
            <InputField
              placeholder="이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRemove={false}
            />
          ) : (
            <div className="flex gap-2 items-center">
              <div className="font-normal leading-4 text-base text-[var(--color-text-muted)] py-[8.5px] pl-[6px]">{email}</div>
              <div onClick={() => setIsChange(true)} style={{ cursor: "pointer" }}>
                <BoxLayoutTag
                  size="small"
                  text="변경하기"
                  addStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid var(--color-muted3)",
                    color: "var(--color-text-base)",
                    fontWeight: "400",
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mb-[208px]">
          <label className="block py-[10px] px-[6px] text-base mb-1 leading-4 tracking-[-0.025em] font-semibold">문의 내용</label>
          <InputField
            isRemove={false}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요. (최대 20자)"
          />
          <Spacing size={24} />
          <TextareaField
            placeholder={`내용을 자세하게 남겨주시면 정확한 답변에 도움이 됩니다. 문의 후 순차적으로 답변 드리고 있으니 조금만 기다려주세요!\n(최대 2,000자) `}
            height="255px"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <ButtonContainer>
          <Button
            onClick={submitContact}
            disabled={title === "" || content === "" || email === ""}
            addStyle={
              title === "" || content === "" || email === ""
                ? {
                    backgroundColor: "rgba(220, 220, 220, 1)",
                    color: "rgba(132, 132, 132, 1)",
                    boxShadow: "-2px 4px 5px 0px rgba(170, 170, 170, 0.1)",
                  }
                : undefined
            }
            text={"문의하기"}
          />
        </ButtonContainer>
      </div>

      <ResultModal
        isModalOpen={isResultModalOpen}
        modalMsg={`문의 주신 내용 확인 후\n이메일로 답변 드리겠습니다`}
        modalTitle="문의 완료"
        setModalOpen={setIsResultModalOpen}
      />
    </>
  );
};

export default CreateContact;
