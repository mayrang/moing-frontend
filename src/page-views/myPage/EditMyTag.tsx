"use client";
import Button from "@/components/designSystem/Buttons/Button";
import ButtonContainer from "@/components/ButtonContainer";
import SearchFilterTag from "@/components/designSystem/tag/SearchFilterTag";
import Spacing from "@/components/Spacing";
import useMyPage from "@/hooks/myPage/useMyPage";
import { myPageStore } from "@/store/client/myPageStore";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WarningToast from "@/components/designSystem/toastMessage/WarningToast";
const TAG_LIST = [
  {
    title: "태그 설정",
    tags: [
      "🇰🇷 국내",
      "🌎 해외",
      "⏱️ 단기",
      "✊ 즉흥",
      "📝 계획",
      "🧳 중장기",
      "🏄‍♂️ 액티비티",
      "☁️ 여유",
      "🍔 먹방",
      "💸 가성비",
      "📷 핫플",
      "🛍️ 쇼핑",
      "🎨 예술",
      "🗿 역사",
      "🏔️ 자연",
      "🥳 단체",
      "😊 소수",
    ] as const,
  },
];

const AGE_LIST = ["10대", "20대", "30대", "40대", "50대 이상"];
export default function EditMyTag() {
  const [isChanged, setIsChanged] = useState(false);
  const {
    agegroup,
    addPreferredTags,
    addAgegroup,
    preferredTags,
    addIsTagUpdated,
  } = myPageStore();
  const { updateMyPageMutation, isUpdatedSuccess } = useMyPage();
  const [taggedArray, setTaggedArray] = useState<string[]>(preferredTags);
  const [limitCountToastShow, setLimitCountToastShow] = useState(false);

  const [age, setAge] = useState(agegroup);
  const router = useRouter();

  const completeClickHandler = () => {
    addPreferredTags([...taggedArray]);
    addAgegroup(age);
    updateMyPageMutation();
  };
  useEffect(() => {
    if (isUpdatedSuccess) {
      addIsTagUpdated(true);
      router.back();
    }
  }, [isUpdatedSuccess]);
  // 버튼 활성화상태.

  const isActive = (tag: string) => {
    // return taggedArray.some(v => v.includes(tag))
    return taggedArray.includes(tag);
  };

  const clickTag = (tag: string) => {
    if (taggedArray.length >= 5) {
      //이미 5개.

      if (!isActive(tag)) {
        setLimitCountToastShow(true);
        return;
      }
    }
    const newArray = taggedArray.includes(tag)
      ? taggedArray.filter((v) => v !== tag)
      : [...taggedArray, tag];
    if (JSON.stringify(newArray) !== JSON.stringify(taggedArray)) {
      setIsChanged(true);
    }

    setTaggedArray(newArray);
  };
  const handleClickage = (ageInput: string) => {
    if (ageInput !== age) {
      setIsChanged(true);
    }
    setAge(ageInput);
  };

  return (
    <div className="px-6">
      <WarningToast
        height={120}
        isShow={limitCountToastShow}
        setIsShow={setLimitCountToastShow}
        text="최대 5개까지 설정할 수 있어요"
      />
      <div className="mt-6">
        <div className="flex items-center py-[10px] px-[6px] text-base font-semibold leading-4 text-left text-[var(--color-text-base)]">연령대를 선택해주세요</div>
        <div className="flex flex-wrap gap-4 w-[70%] mt-2">
          {AGE_LIST.map((ageValue, idx) => (
            <SearchFilterTag
              addStyle={{
                backgroundColor:
                  age === ageValue
                    ? "rgba(227, 239, 217, 1)"
                    : " rgba(240, 240, 240, 1)",
                color:
                  age === ageValue
                    ? "var(--color-keycolor)"
                    : "rgba(52, 52, 52, 1)",
                fontWeight: age === ageValue ? "600" : "400",
                borderRadius: "30px",
                fontSize: "16",
                lineHeight: "22px",
                padding: "10px 20px",
                border:
                  age === ageValue ? `1px solid var(--color-keycolor)` : "none",
              }}
              idx={idx}
              onClick={() => handleClickage(ageValue)}
              text={ageValue}
              key={ageValue}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      </div>
      <div className="mt-9">
        <div className="flex items-center py-[10px] px-[6px] text-base font-semibold leading-4 text-left text-[var(--color-text-base)]">
          취향을 선택해주세요
          <div className="text-sm font-normal leading-4 text-left text-[var(--color-text-muted2)] pl-[10px]">(최대 5개)</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4">
          {TAG_LIST.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 flex-wrap">
              {item.tags.map((tag, idx) => (
                <SearchFilterTag
                  key={tag}
                  idx={idx}
                  addStyle={{
                    backgroundColor: isActive(tag.split(" ")[1])
                      ? "rgba(227, 239, 217, 1)"
                      : " rgba(240, 240, 240, 1)",
                    color: isActive(tag.split(" ")[1])
                      ? "var(--color-keycolor)"
                      : "rgba(52, 52, 52, 1)",
                    border: isActive(tag.split(" ")[1])
                      ? `1px solid var(--color-keycolor)`
                      : `1px solid var(--color-search-bg)`,
                    borderRadius: "30px",
                    fontSize: "16",
                    lineHeight: "22px",
                    padding: "10px 20px",
                    fontWeight: isActive(tag.split(" ")[1]) ? "600" : "400",
                  }}
                  style={{ cursor: "pointer" }}
                  text={tag}
                  onClick={() => clickTag(tag.split(" ")[1])}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <Spacing size={120} />
      <ButtonContainer>
        <Button
          disabled={!isChanged}
          text="완료"
          onClick={completeClickHandler}
          addStyle={{
            backgroundColor:
              taggedArray.length > 0
                ? "rgba(62, 141, 0, 1)"
                : "rgba(220, 220, 220, 1)",
            color:
              taggedArray.length > 0
                ? "rgba(240, 240, 240, 1)"
                : "var(--color-text-muted)",
            boxShadow: "rgba(170, 170, 170, 0.1)",
          }}
        />
      </ButtonContainer>
    </div>
  );
}
